import dayjs from 'dayjs'
import { Request, Response } from 'express'
import _ from 'lodash'
import { ShopsService } from '../../../service'
import { dateFormat, DayKeyVal } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/availableShops:
 *   get:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Return the open shops
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text to search
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: The date where the shops are available. Format should be YYYY-MM-DD. Default value is current date.
 *       - in: query
 *         name: community_id
 *         schema:
 *           type: string
 *         description: ID of the community to search
 *     responses:
 *       200:
 *         description: Array of shops
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 *                 unavailable_shops:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shop'
 */
const getAvailableShops = async (req: Request, res: Response) => {
  const { q = '', date = dayjs(new Date()).format('YYYY-MM-DD'), community_id }: any = req.query

  if (!community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required.' })

  if (!dateFormat.test(date))
    return res
      .status(400)
      .json({ status: 'error', message: 'Incorrect date format. Please follow format YYYY-MM-DD.' })

  const initialWheres = []
  if (q) initialWheres.push(['keywords', 'array-contains', q])

  const maxRangeDays = 30
  const day = DayKeyVal[dayjs(date).day()]

  let everyDay = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['operating_hours.repeat_unit', '==', 1],
      ['operating_hours.repeat_type', '==', 'day'],
    ],
  })
  everyDay = everyDay.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyNDay = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['operating_hours.repeat_unit', 'not-in', [0, 1]],
      ['operating_hours.repeat_type', '==', 'day'],
    ],
  })
  everyNDay = everyNDay.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    const isValid =
      dayjs(date).diff(start_date, 'days') % _.get(shop, 'operating_hours.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyWeek = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`operating_hours.schedule.${day}.repeat_unit`, '==', 1],
      [`operating_hours.schedule.${day}.repeat_type`, '==', 'week'],
    ],
  })
  everyWeek = everyWeek.filter((shop) => {
    const start_date = _.get(shop, `operating_hours.schedule.${day}.start_date`)
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyNWeek = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`operating_hours.schedule.${day}.repeat_unit`, 'not-in', [0, 1]],
      [`operating_hours.schedule.${day}.repeat_type`, '==', 'week'],
    ],
  })
  everyNWeek = everyNWeek.filter((shop) => {
    const start_date = _.get(shop, `operating_hours.schedule.${day}.start_date`)
    const isValid =
      dayjs(date).diff(start_date, 'weeks') % _.get(shop, 'operating_hours.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyMonth = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['operating_hours.repeat_unit', '==', 1],
      ['operating_hours.repeat_type', '==', 'month'],
    ],
  })
  everyMonth = everyMonth.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    const isValid = dayjs(start_date).date() === dayjs(date).date()
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyNMonth = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`operating_hours.repeat_unit`, 'not-in', [0, 1]],
      [`operating_hours.repeat_type`, '==', 'month'],
    ],
  })
  everyNMonth = everyNMonth.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    const isValid =
      dayjs(start_date).date() === dayjs(date).date() &&
      dayjs(date).diff(start_date, 'months') % _.get(shop, 'operating_hours.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let customAvailable = await ShopsService.getCustomAvailableShopsByDate(date)
  customAvailable = customAvailable.filter((s) => {
    return !s.archived && s.community_id === community_id && (!q || s.keywords.includes(q))
  })

  let unavailable = await ShopsService.getCustomUnavailableShopsByDate(date)
  unavailable = unavailable.filter((s) => {
    return !s.archived && s.community_id === community_id && (!q || s.keywords.includes(q))
  })
  const unavailableIds = unavailable.map((shop) => shop.id)

  const allAvailable = [
    ...everyDay,
    ...everyNDay,
    ...everyWeek,
    ...everyNWeek,
    ...everyMonth,
    ...everyNMonth,
    ...customAvailable,
  ]
  const result = _.chain(allAvailable)
    .filter((shop) => !_.includes(unavailableIds, shop.id))
    .uniqBy((shop) => shop.id)
    .value()

  const availableIds = _.map(result, (shop) => shop.id)

  result.forEach((shop) => {
    delete shop.keywords
    delete shop.operating_hours
  })

  const allUnavailableFilter =
    availableIds.length > 0 ? [...initialWheres, ['id', 'not-in', availableIds.slice(0, 10)]] : null
  let unavailable_shops = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: allUnavailableFilter || initialWheres,
  })
  unavailable_shops = unavailable_shops.filter((s) => !availableIds.includes(s.id))

  unavailable_shops.forEach((shop) => {
    const operating_hours = shop.operating_hours
    const repeat_unit = operating_hours.repeat_unit
    const repeat_type = operating_hours.repeat_type
    const firstStartDate = operating_hours.start_dates[0]
    let availabilityFound
    let i = 1
    while (!availabilityFound && i <= maxRangeDays) {
      const dateToCheck = dayjs(date).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const dateToCheckDay = DayKeyVal[dateToCheck.day()]
      if (
        !_.get(operating_hours, `schedule.custom.${dateToCheckFormat}.unavailable`) ||
        (repeat_unit === 0 && dayjs(firstStartDate).isBefore(date))
      ) {
        const weekAvailabilityStartDate = _.get(
          operating_hours,
          `schedule.${dateToCheckDay}.start_date`
        )
        if (
          _.get(operating_hours, `schedule.custom.${dateToCheckFormat}.start_time`) ||
          (repeat_unit === 1 && repeat_type === 'day') ||
          (repeat_unit === 1 &&
            repeat_type === 'week' &&
            weekAvailabilityStartDate &&
            (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
              dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
          (repeat_unit === 1 &&
            repeat_type === 'month' &&
            dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
            (dayjs(firstStartDate).isBefore(dateToCheck) ||
              dayjs(firstStartDate).isSame(dateToCheck))) ||
          (repeat_unit !== 1 &&
            repeat_type === 'day' &&
            dayjs(dateToCheck).diff(firstStartDate, 'days') % repeat_unit === 0 &&
            (dayjs(firstStartDate).isBefore(dateToCheck) ||
              dayjs(firstStartDate).isSame(dateToCheck))) ||
          (repeat_unit !== 1 &&
            repeat_type === 'week' &&
            dayjs(dateToCheck).diff(weekAvailabilityStartDate, 'weeks') % repeat_unit === 0 &&
            (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
              dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
          (repeat_unit !== 1 &&
            repeat_type === 'month' &&
            dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
            dayjs(dateToCheck).diff(firstStartDate, 'months') % repeat_unit === 0 &&
            (dayjs(firstStartDate).isBefore(dateToCheck) ||
              dayjs(firstStartDate).isSame(dateToCheck)))
        ) {
          availabilityFound = dateToCheckFormat
        }
      }
      i++
    }
    if (availabilityFound) {
      shop.nextAvailable = availabilityFound
      shop.nextAvailableDay = DayKeyVal[dayjs(availabilityFound).day()]
      if (dayjs(availabilityFound).diff(dayjs(date), 'days') === 1) {
        shop.availableMessage = `Available tomorrow`
      } else {
        shop.availableMessage = `Available on ${availabilityFound}`
      }
    } else if (repeat_unit === 0 && dayjs(firstStartDate).isBefore(date)) {
      shop.nextAvailable = 'none'
      shop.availableMessage = `Not available anymore`
    } else {
      shop.nextAvailable = `more than ${maxRangeDays} days`
      shop.availableMessage = `Available in ${maxRangeDays}+ days`
    }

    delete shop.keywords
    delete shop.operating_hours
  })

  unavailable_shops.sort((a, b) => {
    return a.nextAvailable < b.nextAvailable ? -1 : 1
  })

  return res.status(200).json({ status: 'ok', data: result, unavailable_shops })
}

export default getAvailableShops

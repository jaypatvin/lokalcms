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
    wheres: [...initialWheres, ['operating_hours.repeat', '==', 'every_day']],
  })
  everyDay = everyDay.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyWeek = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [...initialWheres, [`operating_hours.schedule.${day}.repeat`, '==', 'every_week']],
  })
  everyWeek = everyWeek.filter((shop) => {
    const start_date = _.get(shop, `operating_hours.schedule.${day}.start_date`)
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let customAvailable = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: initialWheres,
    orderBy: `operating_hours.schedule.custom.${date}.start_time`,
  })

  let everyOtherDay = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [...initialWheres, ['operating_hours.repeat', '==', 'every_other_day']],
  })
  everyOtherDay = everyOtherDay.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    const isValid = dayjs(start_date).diff(date, 'days') % 2 === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyOtherWeek = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`operating_hours.schedule.${day}.repeat`, '==', 'every_other_week'],
    ],
  })
  everyOtherWeek = everyOtherWeek.filter((shop) => {
    const start_date = _.get(shop, `operating_hours.schedule.${day}.start_date`)
    const isValid = dayjs(start_date).diff(date, 'days') % 14 === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyMonth = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [...initialWheres, ['operating_hours.repeat', '==', 'every_month']],
  })
  everyMonth = everyMonth.filter((shop) => {
    const start_date = shop.operating_hours.start_dates[0]
    const isValid = dayjs(start_date).date() === dayjs(date).date()
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  const unavailable = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: [...initialWheres, [`operating_hours.schedule.custom.${date}.unavailable`, '==', true]],
  })
  const unavailableIds = unavailable.map((shop) => shop.id)

  const allAvailable = [
    ...everyDay,
    ...everyWeek,
    ...customAvailable,
    ...everyOtherDay,
    ...everyOtherWeek,
    ...everyMonth,
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

  const allUnavailableFilter = availableIds.length > 0 ? [...initialWheres, ['id', 'not-in', availableIds]] : null
  const unavailable_shops = await ShopsService.getCommunityShopsWithFilter({
    community_id,
    wheres: allUnavailableFilter || initialWheres,
  })


  unavailable_shops.forEach((shop) => {
    const operating_hours = shop.operating_hours
    const repeat = operating_hours.repeat
    const firstStartDate = operating_hours.start_dates[0]
    let availabilityFound
    let i = 1
    while (!availabilityFound && i <= maxRangeDays) {
      const dateToCheck = dayjs(date).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const dateToCheckDay = DayKeyVal[dateToCheck.day()]
      if (
        !_.get(operating_hours, `schedule.custom.${dateToCheckFormat}.unavailable`) ||
        (repeat === 'none' && dayjs(firstStartDate).isBefore(date))
      ) {
        const weekAvailabilityStartDate = _.get(
          operating_hours,
          `schedule.${dateToCheckDay}.start_date`
        )
        if (
          _.get(operating_hours, `schedule.custom.${dateToCheckFormat}.start_time`) ||
          repeat === 'every_day' ||
          (repeat === 'every_week' &&
            weekAvailabilityStartDate &&
            (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
              dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
          (repeat === 'every_month' &&
            dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
            (dayjs(firstStartDate).isBefore(dateToCheck) ||
              dayjs(firstStartDate).isSame(dateToCheck))) ||
          (repeat === 'every_other_day' &&
            dayjs(firstStartDate).diff(dateToCheck, 'days') % 2 === 0 &&
            (dayjs(firstStartDate).isBefore(dateToCheck) ||
              dayjs(firstStartDate).isSame(dateToCheck))) ||
          (repeat === 'every_other_week' &&
            dayjs(firstStartDate).diff(dateToCheck, 'days') % 14 === 0 &&
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
    } else if (repeat === 'none' && dayjs(firstStartDate).isBefore(date)) {
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

import dayjs from 'dayjs'
import { Request, Response } from 'express'
import _ from 'lodash'
import { ProductsService } from '../../../service'
import { dateFormat, DayKeyVal } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/availableProducts:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will return list products that are available and unavailable
 *       ## Note: The unavailable products will have an extra fields _nextAvailable_, _nextAvailableDay_ and _availableMessage_
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
 *         description: The date where the products are available. Format should be YYYY-MM-DD. Default value is current date.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category for products
 *       - in: query
 *         name: community_id
 *         schema:
 *           type: string
 *         description: ID of the community to search
 *       - in: query
 *         name: shop_id
 *         schema:
 *           type: string
 *         description: ID of the shop to search
 *     responses:
 *       200:
 *         description: Array of products
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
 *                     $ref: '#/components/schemas/Product'
 */
const getAvailableProducts = async (req: Request, res: Response) => {
  const {
    q = '',
    date = dayjs(new Date()).format('YYYY-MM-DD'),
    category,
    community_id,
    shop_id
  }: any = req.query

  if (!community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required.' })

  if (!dateFormat.test(date))
    return res
      .status(400)
      .json({ status: 'error', message: 'Incorrect date format. Please follow format YYYY-MM-DD.' })

  const initialWheres = []
  if (q) initialWheres.push(['keywords', 'array-contains', q])
  if (category) initialWheres.push(['product_category', '==', category])
  if (shop_id) initialWheres.push(['shop_id', '==', shop_id])

  const maxRangeDays = 30
  const day = DayKeyVal[dayjs(date).day()]
  const dateNum = dayjs(date).date()
  const nthWeek = Math.ceil(dateNum / 7)
  const nthDayOfMonth = `${nthWeek}-${day}`

  let everyDay = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['availability.repeat_unit', '==', 1],
      ['availability.repeat_type', '==', 'day'],
    ],
  })
  everyDay = everyDay.filter((product) => {
    const start_date = product.availability.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyNDay = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['availability.repeat_unit', 'not-in', [0, 1]],
      ['availability.repeat_type', '==', 'day'],
    ],
  })
  everyNDay = everyNDay.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid =
      dayjs(date).diff(start_date, 'days') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyWeek = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`availability.schedule.${day}.repeat_unit`, '==', 1],
      [`availability.schedule.${day}.repeat_type`, '==', 'week'],
    ],
  })
  everyWeek = everyWeek.filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyNWeek = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`availability.schedule.${day}.repeat_unit`, 'not-in', [0, 1]],
      [`availability.schedule.${day}.repeat_type`, '==', 'week'],
    ],
  })
  everyNWeek = everyNWeek.filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    const isValid =
      dayjs(date).diff(start_date, 'weeks') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyMonth = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['availability.repeat_unit', '==', 1],
      ['availability.repeat_type', '==', 'month'],
    ],
  })
  everyMonth = everyMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).date() === dateNum
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyNMonth = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      [`availability.repeat_unit`, 'not-in', [0, 1]],
      [`availability.repeat_type`, '==', 'month'],
    ],
  })
  everyNMonth = everyNMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid =
      dayjs(start_date).date() === dateNum &&
      dayjs(date).diff(start_date, 'months') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyNthDayOfMonth = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['availability.repeat_unit', '==', 1],
      ['availability.repeat_type', '==', nthDayOfMonth],
    ],
  })
  everyNthDayOfMonth = everyNthDayOfMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyNthDayOfNMonth = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [
      ...initialWheres,
      ['availability.repeat_unit', 'not-in', [0, 1]],
      ['availability.repeat_type', '==', nthDayOfMonth],
    ],
  })
  everyNthDayOfNMonth = everyNthDayOfNMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid =
      dayjs(date).diff(start_date, 'months') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let customAvailable = await ProductsService.getCustomAvailableProductsByDate(date)
  customAvailable = customAvailable.filter((p) => {
    return (
      !p.archived &&
      p.community_id === community_id &&
      (!category || p.product_category === category) &&
      (!q || p.keywords.includes(q))
    )
  })

  let unavailable = await ProductsService.getCustomUnavailableProductsByDate(date)
  unavailable = unavailable.filter((p) => {
    return (
      !p.archived &&
      p.community_id === community_id &&
      (!category || p.product_category === category) &&
      (!q || p.keywords.includes(q))
    )
  })
  const unavailableIds = unavailable.map((product) => product.id)

  const allAvailable = [
    ...everyDay,
    ...everyNDay,
    ...everyWeek,
    ...everyNWeek,
    ...everyMonth,
    ...everyNMonth,
    ...everyNthDayOfMonth,
    ...everyNthDayOfNMonth,
    ...customAvailable,
  ]
  const result = _.chain(allAvailable)
    .filter((product) => !_.includes(unavailableIds, product.id))
    .uniqBy((product) => product.id)
    .value()

  const availableIds = _.map(result, (product) => product.id)

  result.forEach((product) => {
    delete product.keywords
    delete product.availability
  })

  const allUnavailableFilter =
    availableIds.length > 0 ? [...initialWheres, ['id', 'not-in', availableIds.slice(0, 10)]] : null
  let unavailable_products = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: allUnavailableFilter || initialWheres,
  })
  unavailable_products = unavailable_products.filter((p) => !availableIds.includes(p.id))

  unavailable_products.forEach((product) => {
    const availability = product.availability
    const repeat_unit = availability.repeat_unit
    const repeat_type = availability.repeat_type
    const firstStartDate = availability.start_dates[0]
    let availabilityFound
    let i = 1
    while (!availabilityFound && i <= maxRangeDays) {
      const dateToCheck = dayjs(date).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const dateToCheckDay = DayKeyVal[dateToCheck.day()]
      const dateNumToCheck = dayjs(dateToCheck).date()
      const nthWeekToCheck = Math.ceil(dateNumToCheck / 7)
      const nthDayOfMonthToCheck = `${nthWeekToCheck}-${dateToCheckDay}`
      if (
        !_.get(availability, `schedule.custom.${dateToCheckFormat}.unavailable`) ||
        (repeat_unit === 0 && dayjs(firstStartDate).isBefore(date))
      ) {
        const weekAvailabilityStartDate = _.get(
          availability,
          `schedule.${dateToCheckDay}.start_date`
        )
        if (
          _.get(availability, `schedule.custom.${dateToCheckFormat}.start_time`) ||
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
          (repeat_unit === 1 &&
            repeat_type === nthDayOfMonthToCheck &&
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
              dayjs(firstStartDate).isSame(dateToCheck))) ||
          (repeat_unit !== 1 &&
            repeat_type === nthDayOfMonthToCheck &&
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
      product.nextAvailable = availabilityFound
      product.nextAvailableDay = DayKeyVal[dayjs(availabilityFound).day()]
      if (dayjs(availabilityFound).diff(dayjs(date), 'days') === 1) {
        product.availableMessage = `Available tomorrow`
      } else {
        product.availableMessage = `Available on ${availabilityFound}`
      }
    } else if (repeat_unit === 0 && dayjs(firstStartDate).isBefore(date)) {
      product.nextAvailable = 'none'
      product.availableMessage = `Not available anymore`
    } else {
      product.nextAvailable = `more than ${maxRangeDays} days`
      product.availableMessage = `Available in ${maxRangeDays}+ days`
    }

    delete product.keywords
    delete product.availability
  })

  unavailable_products.sort((a, b) => {
    return a.nextAvailable < b.nextAvailable ? -1 : 1
  })

  return res.status(200).json({ status: 'ok', data: [...result, ...unavailable_products] })
}

export default getAvailableProducts

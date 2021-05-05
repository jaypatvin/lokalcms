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
 *     description: Return the products
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
 *                 unavailable_products:
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

  const maxRangeDays = 30
  const day = DayKeyVal[dayjs(date).day()]

  let everyDay = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, ['availability.repeat', '==', 'every_day']],
  })
  everyDay = everyDay.filter((product) => {
    const start_date = product.availability.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyWeek = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, [`availability.schedule.${day}.repeat`, '==', 'every_week']],
  })
  everyWeek = everyWeek.filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let customAvailable = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: initialWheres,
    orderBy: `availability.schedule.custom.${date}.start_time`,
  })

  let everyOtherDay = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, ['availability.repeat', '==', 'every_other_day']],
  })
  everyOtherDay = everyOtherDay.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).diff(date, 'days') % 2 === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyOtherWeek = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, [`availability.schedule.${day}.repeat`, '==', 'every_other_week']],
  })
  everyOtherWeek = everyOtherWeek.filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    const isValid = dayjs(start_date).diff(date, 'days') % 14 === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyMonth = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, ['availability.repeat', '==', 'every_month']],
  })
  everyMonth = everyMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).date() === dayjs(date).date()
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  const unavailable = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, [`availability.schedule.custom.${date}.unavailable`, '==', true]],
  })
  const unavailableIds = unavailable.map((product) => product.id)

  const allAvailable = [
    ...everyDay,
    ...everyWeek,
    ...customAvailable,
    ...everyOtherDay,
    ...everyOtherWeek,
    ...everyMonth,
  ]
  const result = _.chain(allAvailable)
    .filter((product) => !_.includes(unavailableIds, product.id))
    .uniqBy((product) => product.id)
    .value()

  const availableIds = _.map(result, (product) => product.id)

  const unavailable_products = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, ['id', 'not-in', availableIds]],
  })

  result.forEach((product) => {
    delete product.keywords
    delete product.availability
  })

  unavailable_products.forEach((product) => {
    const availability = product.availability
    const repeat = availability.repeat
    const firstStartDate = availability.start_dates[0]
    let availabilityFound
    let i = 1
    while (!availabilityFound && i <= maxRangeDays) {
      const dateToCheck = dayjs(date).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const dateToCheckDay = DayKeyVal[dateToCheck.day()]
      if (
        !_.get(availability, `schedule.custom.${dateToCheckFormat}.unavailable`) ||
        (repeat === 'none' && dayjs(firstStartDate).isBefore(date))
      ) {
        const weekAvailabilityStartDate = _.get(
          availability,
          `schedule.${dateToCheckDay}.start_date`
        )
        if (
          _.get(availability, `schedule.custom.${dateToCheckFormat}.start_time`) ||
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
      product.nextAvailable = availabilityFound
      product.nextAvailableDay = DayKeyVal[dayjs(availabilityFound).day()]
      product.availableMessage = `Available on ${availabilityFound}`
    } else if (repeat === 'none' && dayjs(firstStartDate).isBefore(date)) {
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

  return res.status(200).json({ status: 'ok', data: result, unavailable_products })
}

export default getAvailableProducts

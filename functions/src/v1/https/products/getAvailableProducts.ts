import dayjs from 'dayjs'
import { Request, Response } from 'express'
import _ from 'lodash'
import { ProductsService } from '../../../service'
import { dateFormat, DayKeyVal } from '../../../utils/helpers'
import isDateValidInSchedule from '../../../utils/isDateValidInSchedule'

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
    shop_id,
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

  const allProducts = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: initialWheres,
  })

  const productsMap = allProducts.reduce((acc, product) => {
    const availability = product.availability
    const repeat_unit = availability.repeat_unit === 1 ? '1' : 'n'
    const repeat_type = availability.repeat_type
    if (!acc[`${repeat_unit}_${repeat_type}`]) acc[`${repeat_unit}_${repeat_type}`] = []
    acc[`${repeat_unit}_${repeat_type}`].push(product)
    return acc
  }, {})

  // get available products that are available every day
  const everyDay = productsMap['1_day'].filter((product) => {
    const start_date = product.availability.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })
  // get available products that are available every n day
  const everyNDay = productsMap['n_day'].filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid =
      dayjs(date).diff(start_date, 'days') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available products that are available every week
  const everyWeek = productsMap['1_week'].filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })
  // get available products that are available every n week
  const everyNWeek = productsMap['n_week'].filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    const isValid =
      dayjs(date).diff(start_date, 'weeks') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available products that are available every month
  const everyMonth = productsMap['1_month'].filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).date() === dateNum
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available products that are available every n month
  const everyNMonth = productsMap['n_month'].filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid =
      dayjs(start_date).date() === dateNum &&
      dayjs(date).diff(start_date, 'months') % _.get(product, 'availability.repeat_unit') === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })
  // get available products that are available every nth day of the month
  const everyNthDayOfMonth = productsMap[`1_${nthDayOfMonth}`].filter((product) => {
    const start_date = product.availability.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })
  // get available products that are available every nth day of every n month
  const everyNthDayOfNMonth = productsMap[`1_${nthDayOfMonth}`].filter((product) => {
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
    const schedule = availability.schedule
    const repeat_unit = availability.repeat_unit
    const repeat_type = availability.repeat_type
    const firstStartDate = availability.start_dates[0]
    let availabilityFound
    let i = 1
    while (!availabilityFound && i <= maxRangeDays) {
      const dateToCheck = dayjs(date).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const isDateValid = isDateValidInSchedule({
        repeat_type,
        repeat_unit,
        schedule,
        startDate: firstStartDate,
        dateToCheck,
      })
      if (isDateValid) {
        availabilityFound = dateToCheckFormat
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

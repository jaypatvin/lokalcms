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

  let everyOtherMonth = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, ['availability.repeat', '==', 'every_month']],
  })
  everyOtherMonth = everyOtherMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).date === dayjs(date).date
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  const unavailable = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [...initialWheres, [`availability.schedule.custom.${date}.unavailable`, '==', true]],
  })
  const unavailableIds = unavailable.map((product) => product.id)

  const result = [
    ...everyDay,
    ...everyWeek,
    ...customAvailable,
    ...everyOtherDay,
    ...everyOtherWeek,
    ...everyOtherMonth,
  ].filter((product) => !_.includes(unavailableIds, product.id))

  result.forEach((product) => {
    delete product.keywords
    delete product.availability
  })

  return res.status(200).json({ status: 'ok', data: result })
}

export default getAvailableProducts

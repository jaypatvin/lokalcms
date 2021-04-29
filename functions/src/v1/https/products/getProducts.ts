import dayjs from 'dayjs'
import { Request, Response } from 'express'
import _ from 'lodash'
import { ProductsService } from '../../../service'
import { DayKeyVal } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/products:
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
 *         description: The date where the products are available
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
const getProducts = async (req: Request, res: Response) => {
  const {
    q,
    date = dayjs(new Date()).format('YYYY-MM-DD'),
    category,
    community_id,
  }: any = req.query

  if (!community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required.' })

  const day = DayKeyVal[dayjs(date).day()]

  let everyday = await ProductsService.getCommunityProductsWhere(community_id, [
    ['availability.repeat', '==', 'every_day'],
  ])
  everyday = everyday.filter((product) => {
    const start_date = product.availability.start_dates[0]
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let everyweek = await ProductsService.getCommunityProductsWhere(community_id, [
    [`availability.schedule.${day}.repeat`, '==', 'every_week'],
  ])
  everyweek = everyweek.filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    return dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date)
  })

  let customAvailable = await ProductsService.getCommunityProductsOrderFilter(
    community_id,
    `availability.schedule.custom.${date}.start_time`
  )

  let everyOtherDay = await ProductsService.getCommunityProductsWhere(community_id, [
    ['availability.repeat', '==', 'every_other_day'],
  ])
  everyOtherDay = everyOtherDay.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).diff(date, 'days') % 2 === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyOtherWeek = await ProductsService.getCommunityProductsWhere(community_id, [
    [`availability.schedule.${day}.repeat`, '==', 'every_other_week'],
  ])
  everyOtherWeek = everyOtherWeek.filter((product) => {
    const start_date = _.get(product, `availability.schedule.${day}.start_date`)
    const isValid = dayjs(start_date).diff(date, 'days') % 14 === 0
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  let everyOtherMonth = await ProductsService.getCommunityProductsWhere(community_id, [
    ['availability.repeat', '==', 'every_month'],
  ])
  everyOtherMonth = everyOtherMonth.filter((product) => {
    const start_date = product.availability.start_dates[0]
    const isValid = dayjs(start_date).date === dayjs(date).date
    return isValid && (dayjs(start_date).isBefore(date) || dayjs(start_date).isSame(date))
  })

  const unavailable = await ProductsService.getCommunityProductsWhere(community_id, [
    [`availability.schedule.custom.${date}.unavailable`, '==', true],
  ])
  const unavailableIds = unavailable.map((product) => product.id)

  const result = [
    ...everyday,
    ...everyweek,
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

export default getProducts

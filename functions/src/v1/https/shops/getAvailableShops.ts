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

  const result = [
    ...everyDay,
    ...everyWeek,
    ...customAvailable,
    ...everyOtherDay,
    ...everyOtherWeek,
    ...everyMonth,
  ].filter((shop) => !_.includes(unavailableIds, shop.id))

  result.forEach((shop) => {
    delete shop.keywords
    delete shop.operating_hours
  })

  return res.status(200).json({ status: 'ok', data: result })
}

export default getAvailableShops

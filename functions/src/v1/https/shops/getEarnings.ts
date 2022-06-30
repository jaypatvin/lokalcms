import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'
import { Order } from '../../../models'

/**
 * @openapi
 * /v1/shops/{shopId}/earnings:
 *   post:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shop
 *         schema:
 *           type: string
 *           required: true
 *       - in: query
 *         name: minDate
 *         schema:
 *           type: string
 *           format: date-time
 *           required: true
 *       - in: query
 *         name: maxDate
 *         schema:
 *           type: string
 *           format: date-time
 *           required: true
 *     description: Returns shop earnings with the date range
 *     responses:
 *       200:
 *         description: The total earnings of the shop within the date rnange
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: number
 *                   example: 1000000
 */
const getEarnings: RequestHandler = async (req, res) => {
  const { shopId } = req.params
  const { searchKey } = res.locals
  const data = req.body as {
    minDate: Date
    maxDate: Date
  }
  const { minDate, maxDate } = data

  if ((minDate && !maxDate) || (!minDate && maxDate)) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'minDate and maxDate is both required',
    })
  }

  if (minDate && maxDate && new Date(minDate).getTime() >= new Date(maxDate).getTime()) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'minDate must be lower than maxDate',
    })
  }

  if (!searchKey) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const ordersIndex = client.initIndex('orders')

  console.log('fucking shit1', new Date(minDate).getTime() / 1000)
  console.log('fucking shit2', new Date(maxDate).getTime() / 1000)

  const filtersArray = [`shop_id:${shopId}`, 'status_code:600']
  if (minDate && maxDate) {
    filtersArray.push(
      `delivered_date._seconds:${new Date(minDate).getTime() / 1000} TO ${
        new Date(maxDate).getTime() / 1000
      }`
    )
  }
  const { hits } = await ordersIndex.search<Order>('', {
    filters: filtersArray.join(' AND '),
    attributesToHighlight: [],
  })

  const totalEarnings = hits.reduce((acc, order) => {
    acc += order.total_price
    return acc
  }, 0)

  return res.json({ status: 'ok', data: totalEarnings })
}

export default getEarnings

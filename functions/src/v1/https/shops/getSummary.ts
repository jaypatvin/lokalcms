import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'
import { Order } from '../../../models'

type ProductSold = {
  id: string
  name: string
  sold_count: number
}

/**
 * @openapi
 * /v1/shops/{shopId}/summary:
 *   post:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minDate:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *               maxDate:
 *                 type: string
 *                 format: date-time
 *                 required: true
 *     description: Returns shop earnings and products sold count within the date range
 *     responses:
 *       200:
 *         description: The total earnings and products sold count of the shop within the date rnange
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_earnings:
 *                       type: number
 *                       example: 1000000
 *                     products_sold:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           sold_count:
 *                             type: number
 */
const geSummary: RequestHandler = async (req, res) => {
  const { shopId } = req.params
  const { searchKey } = res.locals
  const bodyData = req.body as {
    minDate: Date
    maxDate: Date
  }
  const { minDate, maxDate } = bodyData

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

  const data = hits.reduce<{ total_earnings: number; products_sold: ProductSold[] }>(
    (acc, order) => {
      acc.total_earnings += order.total_price
      for (const orderProduct of order.products) {
        const soldProduct = acc.products_sold.find((p) => p.id === orderProduct.id)
        if (!soldProduct) {
          acc.products_sold.push({
            id: orderProduct.id,
            name: orderProduct.name,
            sold_count: orderProduct.quantity,
          })
        } else {
          soldProduct.sold_count += orderProduct.quantity
        }
      }
      return acc
    },
    { total_earnings: 0, products_sold: [] }
  )

  return res.json({ status: 'ok', data })
}

export default geSummary

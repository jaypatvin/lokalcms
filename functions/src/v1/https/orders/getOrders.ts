import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/orders:
 *   get:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text to search
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *       - in: query
 *         name: community
 *         schema:
 *           type: string
 *       - in: query
 *         name: shop
 *         schema:
 *           type: string
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *       - in: query
 *         name: buyer
 *         schema:
 *           type: string
 *       - in: query
 *         name: seller
 *         schema:
 *           type: string
 *       - in: query
 *         name: delivery_option
 *         schema:
 *           type: string
 *           enum: [pickup, delivery]
 *       - in: query
 *         name: paid
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: payment_method
 *         schema:
 *           type: string
 *           enum: [bank, cod]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *     description: Returns orders
 *     responses:
 *       200:
 *         description: List of orders
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
 *                     $ref: '#/components/schemas/Order'
 */
const getOrders: RequestHandler = async (req, res) => {
  const { searchKey } = res.locals
  const {
    q: query = '',
    page = 0,
    limit: hitsPerPage = 100,
    community,
    shop,
    product,
    buyer,
    seller,
    deliveryOption,
    paid,
    paymentMethod,
    category,
    status,
    sortBy,
    sortOrder,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    shop?: string
    product?: string
    buyer?: string
    seller?: string
    deliveryOption?: 'pickup' | 'delivery'
    paid?: boolean
    paymentMethod?: 'cod' | 'bank'
    category?: string
    status?: number
    sortBy: 'created_at'
    sortOrder: 'asc' | 'desc'
  }

  if (!searchKey) {
    throw generateError(ErrorCode.OrderApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  let ordersIndex
  if (sortOrder === 'asc') {
    ordersIndex = client.initIndex('orders')
  } else {
    ordersIndex = client.initIndex('orders_created_at_desc')
  }

  const filtersArray = []
  if (community) {
    filtersArray.push(`community_id:${community}`)
  }
  if (shop) {
    filtersArray.push(`shop_id:${shop}`)
  }
  if (product) {
    filtersArray.push(`product_ids:${product}`)
  }
  if (seller) {
    filtersArray.push(`seller_id:${seller}`)
  }
  if (buyer) {
    filtersArray.push(`buyer_id:${buyer}`)
  }
  if (deliveryOption) {
    filtersArray.push(`delivery_option:${deliveryOption}`)
  }
  if (paid) {
    filtersArray.push(`is_paid:${paid}`)
  }
  if (paymentMethod) {
    filtersArray.push(`payment_method:${paymentMethod}`)
  }
  if (category) {
    filtersArray.push(`products.category:${category}`)
  }
  if (status) {
    filtersArray.push(`status_code:${status}`)
  }

  const { hits, nbPages, nbHits } = await ordersIndex.search(query, {
    page,
    hitsPerPage,
    ...(filtersArray.length ? { filters: filtersArray.join(' AND ') } : {}),
    attributesToHighlight: [],
  })

  const data = hits.map((hit) => ({
    ...hit,
    id: hit.objectID,
    // @ts-ignore
    created_at: new Date(hit.created_at._seconds * 1000),
    // @ts-ignore
    ...(hit.updated_at ? { updated_at: new Date(hit.updated_at._seconds * 1000) } : {}),
  }))

  return res.json({ status: 'ok', data, pages: nbPages, totalItems: nbHits })
}

export default getOrders
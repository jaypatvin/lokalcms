import { RequestHandler } from 'express'
import algoliasearch from 'algoliasearch'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/productSubscriptionPlans:
 *   get:
 *     tags:
 *       - product subscription plans
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
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [bank, cod]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     description: Returns productSubscriptionPlans
 *     responses:
 *       200:
 *         description: List of productSubscriptionPlans
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
 *                     $ref: '#/components/schemas/ProductSubscriptionPlan'
 */
const getProductSubscriptionPlans: RequestHandler = async (req, res) => {
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
    paymentMethod,
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
    paymentMethod?: 'cod' | 'bank'
    status?: string
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
  let productSubscriptionPlansIndex
  if (sortOrder === 'asc') {
    productSubscriptionPlansIndex = client.initIndex('product_subscription_plans')
  } else {
    productSubscriptionPlansIndex = client.initIndex('product_subscription_plans_created_at_desc')
  }

  const filtersArray = []
  if (community) {
    filtersArray.push(`community_id:${community}`)
  }
  if (shop) {
    filtersArray.push(`shop_id:${shop}`)
  }
  if (product) {
    filtersArray.push(`product_id:${product}`)
  }
  if (seller) {
    filtersArray.push(`seller_id:${seller}`)
  }
  if (buyer) {
    filtersArray.push(`buyer_id:${buyer}`)
  }
  if (paymentMethod) {
    filtersArray.push(`payment_method:${paymentMethod}`)
  }
  if (status) {
    filtersArray.push(`status_code:${status}`)
  }

  const { hits, nbPages, nbHits } = await productSubscriptionPlansIndex.search(query, {
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

export default getProductSubscriptionPlans

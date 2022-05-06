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
 *         name: payment_method
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
    payment_method,
    status,
  } = req.query as unknown as {
    q: string
    page: number
    limit: number
    community?: string
    shop?: string
    product?: string
    buyer?: string
    seller?: string
    payment_method?: 'cod' | 'bank'
    status?: string
  }

  if (!searchKey) {
    throw generateError(ErrorCode.OrderApiError, {
      message: 'invalid searchKey',
    })
  }

  const appId = get(functions.config(), 'algolia_config.app_id')
  const client = algoliasearch(appId, searchKey)
  const productSubscriptionPlansIndex = client.initIndex('product_subscription_plans')

  const { hits, nbPages, nbHits } = await productSubscriptionPlansIndex.search(query, {
    page,
    hitsPerPage,
    ...(community ? { filters: `community_id:${community}` } : {}),
    ...(shop ? { filters: `shop_id:${shop}` } : {}),
    ...(product ? { filters: `product_id:${product}` } : {}),
    ...(seller ? { filters: `seller_id:${seller}` } : {}),
    ...(buyer ? { filters: `buyer_id:${buyer}` } : {}),
    ...(payment_method ? { filters: `payment_method:${payment_method}` } : {}),
    ...(status ? { filters: `status_code:${status}` } : {}),
    attributesToHighlight: [],
  })

  return res.json({ status: 'ok', data: hits, pages: nbPages, totalItems: nbHits })
}

export default getProductSubscriptionPlans

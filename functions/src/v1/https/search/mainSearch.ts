import { RequestHandler } from 'express'
import { omit } from 'lodash'
import { Product, Shop } from '../../../models'
import { ProductsService, ShopsService } from '../../../service'
import { generateError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/search:
 *   get:
 *     tags:
 *       - search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Text to search
 *       - in: query
 *         name: criteria
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: ["products", "shops"]
 *             default: "products"
 *         description: Collections to search from
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
 *     description: |
 *       ### This can be used to search for products or shops
 *       # Examples
 *       ```
 *       /v1/search?criteria=products&category=food&community_id=1234
 *       /v1/search?criteria=shops&community_id=1234
 *       ```
 *
 *     responses:
 *       200:
 *         description: Search result
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
 *                     products:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     shops:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Shop'
 */
const mainSearch: RequestHandler = async (req, res) => {
  const {
    q,
    criteria = 'products',
    category,
    community_id,
  } = req.query as {
    q: string
    criteria: string
    category: string
    community_id: string
  }

  if (!community_id) {
    throw generateError(ErrorCode.SearchApiError, {
      message: 'community_id is required',
    })
  }

  const result: {
    products?: (Omit<Product, 'keywords'> & { id: string })[]
    shops?: (Omit<Shop, 'keywords'> & { id: string })[]
  } = {}

  if (
    (typeof criteria === 'string' && criteria === 'products') ||
    (Array.isArray(criteria) && [...criteria].includes('products'))
  ) {
    const searchResult = await ProductsService.searchProducts({ search: q, category, community_id })
    const products = searchResult.map((product) => omit(product, ['keywords']))
    result.products = products
  }

  if (
    (typeof criteria === 'string' && criteria === 'shops') ||
    (Array.isArray(criteria) && [...criteria].includes('shops'))
  ) {
    const searchResult = await ShopsService.searchShops({ search: q, community_id })
    const shops = searchResult.map((shop) => omit(shop, ['keywords']))
    result.shops = shops
  }

  return res.json({ status: 'ok', data: result })
}

export default mainSearch

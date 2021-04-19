import { Request, Response } from 'express'
import { searchProducts } from '../../../service/products'
import { searchShops } from '../../../service/shops'

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
 *     description: Search for products and shops
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
const mainSearch = async (req: Request, res: Response) => {
  const { q, criteria = 'products', category, community_id } = req.query

  if (!community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required.' })

  const result: any = {}

  if (
    (typeof criteria === 'string' && criteria === 'products') ||
    (Array.isArray(criteria) && [...criteria].includes('products'))
  ) {
    const searchResult = await searchProducts({ search: q, category, community_id })
    const products = searchResult.docs.map((doc) => {
      const data = doc.data()
      delete data.keywords
      return data
    })
    result.products = products
  }

  if (
    (typeof criteria === 'string' && criteria === 'shops') ||
    (Array.isArray(criteria) && [...criteria].includes('shops'))
  ) {
    const searchResult = await searchShops({ search: q, community_id })
    const shops = searchResult.docs.map((doc) => {
      const data = doc.data()
      delete data.keywords
      return data
    })
    result.shops = shops
  }

  return res.json({ status: 'ok', data: result })
}

export default mainSearch

import dayjs from 'dayjs'
import { RequestHandler } from 'express'
import { QueryConstraint, where } from 'firebase/firestore'
import { ProductsService } from '../../../service'
import { generateError, ErrorCode } from '../../../utils/generators'
import getScheduledAvailableItems from '../../../utils/getScheduledAvailableItems'
import { dateFormat } from '../../../utils/helpers'

/**
 * @openapi
 * /v1/availableProducts:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will return list of products that are available and unavailable
 *       ## Note: The unavailable products will have an extra fields _nextAvailable_, _nextAvailableDay_ and _availableMessage_
 *     parameters:
 *       - in: query
 *         name: community_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the community to search
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
 *         name: shop_id
 *         schema:
 *           type: string
 *         description: ID of the shop to search
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
const getAvailableProducts: RequestHandler = async (req, res) => {
  const {
    q = '',
    date = dayjs(new Date()).format('YYYY-MM-DD'),
    category,
    community_id,
    shop_id,
  }: any = req.query

  if (!community_id) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'community_id is required',
    })
  }

  if (!dateFormat.test(date)) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'Incorrect date format. Please follow format YYYY-MM-DD',
    })
  }

  const initialWheres: QueryConstraint[] = []
  if (q) initialWheres.push(where('keywords', 'array-contains', q))
  if (category) initialWheres.push(where('product_category', '==', category))
  if (shop_id) initialWheres.push(where('shop_id', '==', shop_id))

  const allProducts = await ProductsService.findCommunityProductsWithFilter({
    community_id,
    wheres: initialWheres,
  })

  const result = getScheduledAvailableItems(allProducts, 'availability', { date })

  return res.status(200).json({ status: 'ok', data: result })
}

export default getAvailableProducts

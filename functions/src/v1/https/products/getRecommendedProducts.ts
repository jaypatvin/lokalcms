import { Request, Response } from 'express'
import { OrdersService, ProductsService } from '../../../service'
import getScheduledAvailableItems from '../../../utils/getScheduledAvailableItems'

/**
 * @openapi
 * /v1/recommendedProducts:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will return list of recommended products based on user's history of ordering, likes and views
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
const getRecommendedProducts = async (req: Request, res: Response) => {
  const buyer_id = res.locals.userDoc.id
  const community_id = res.locals.userDoc.commuity_id

  if (!buyer_id || !community_id) {
    return res.status(400).json({ status: 'error', message: 'community_id is required.' })
  }

  const allProducts = await ProductsService.getProductsByCommunityID(community_id)

  const allUserOrders = await OrdersService.getOrdersByBuyerId(buyer_id)

  // get product categories from all the orders

  // get the top 3 most used category from the products

  // filter the products based on the top categories

  // const products = getScheduledAvailableItems(recommendedProducts, 'availability')

  return res.status(200).json({ status: 'ok', data: products })
}

export default getRecommendedProducts

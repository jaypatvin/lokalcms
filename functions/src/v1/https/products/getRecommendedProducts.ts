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
    return res
      .status(400)
      .json({ status: 'error', message: 'buyer_id and community_id is required.' })
  }

  const allProducts = await ProductsService.getProductsByCommunityID(community_id)

  const allUserOrders = await OrdersService.getOrdersByBuyerId(buyer_id)

  // get product categories from all the orders
  const ordersCategories = allUserOrders.reduce((acc, order) => {
    for (const orderProduct of order.products) {
      const category = orderProduct.product_category
      if (category) {
        if (!acc[category]) acc[category] = 0
        acc[category]++
      }
    }
    return acc
  }, {})


  // get the top 3 most used category from the products
  const sortedCategories = Object.entries(ordersCategories).sort((a, b) => {
    if (a[1] >= b[1]) return 1
    return -1
  })


  const topCategories = []
  for (let i = 0; i < Math.min(sortedCategories.length, 3); i++) {
    topCategories.push(sortedCategories[i][0])
  }

  // filter the products based on the top categories
  const recommendedProducts = allProducts.filter((p) => topCategories.includes(p.product_category))

  const products = getScheduledAvailableItems(recommendedProducts, 'availability')

  return res.status(200).json({ status: 'ok', data: products })
}

export default getRecommendedProducts

import { Request, Response } from 'express'
import { LikesService, OrdersService, ProductsService } from '../../../service'
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
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: community_id
 *         required: true
 *         schema:
 *           type: string
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
  const { user_id, community_id: communityId }: any = req.query
  const buyer_id = res.locals.userDoc.id || user_id
  const community_id = res.locals.userDoc.commuity_id || communityId

  if (!buyer_id || !community_id) {
    return res
      .status(400)
      .json({ status: 'error', message: 'buyer_id and community_id is required.' })
  }

  // get all product likes
  const productLikes = await LikesService.getLikesByUser(buyer_id, 'products')

  const likesCategories = {}
  for (const like of productLikes) {
    if (like.product_id) {
      const product = await ProductsService.getProductByID(like.product_id)
      const category = product.product_category
      if (category) {
        if (!likesCategories[category]) likesCategories[category] = 0
        likesCategories[category]++
      }
    }
  }

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

  // combine the categories lists
  const allCategoriesCounts = { ...likesCategories }
  Object.entries(ordersCategories).forEach(([key, val]) => {
    if (allCategoriesCounts[key]) {
      allCategoriesCounts[key] = allCategoriesCounts[key] + val
    } else {
      allCategoriesCounts[key] = val
    }
  })

  // get the top 3 most used category from the products
  const sortedCategories = Object.entries(allCategoriesCounts).sort((a, b) => {
    if (a[1] >= b[1]) return -1
    return 1
  })

  const topCategories = []
  for (let i = 0; i < Math.min(sortedCategories.length, 3); i++) {
    topCategories.push(sortedCategories[i][0])
  }

  // filter the products based on the top categories
  const recommendedProducts = await ProductsService.getCommunityProductsWithFilter({
    community_id,
    wheres: [['product_category', 'in', topCategories]],
  })

  // get more recommended products based on liked shops

  const products = getScheduledAvailableItems(recommendedProducts, 'availability')

  return res.status(200).json({ status: 'ok', data: products })
}

export default getRecommendedProducts

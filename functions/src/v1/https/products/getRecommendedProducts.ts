import { RequestHandler } from 'express'
import { LikesService, OrdersService, ProductsService } from '../../../service'
import { generateError, ErrorCode } from '../../../utils/generators'
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
const getRecommendedProducts: RequestHandler = async (req, res) => {
  const { user_id, community_id: communityId }: any = req.query
  const buyer_id = res.locals.userDoc.id || user_id
  const community_id = res.locals.userDoc.commuity_id || communityId

  if (!buyer_id || !community_id) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'buyer_id and community_id is required',
    })
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
      const category = orderProduct.category
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

  let products = []
  let moreProducts = []
  if (topCategories.length) {
    // filter the products based on the top categories
    const recommendedProducts = await ProductsService.getCommunityProductsWithFilter({
      community_id,
      wheres: [['product_category', 'in', topCategories]],
    })

    // get more recommended products based on liked shops
    const recommendedProductsIds = recommendedProducts.map((p) => p.id)
    let recommendedShopProducts = []
    if (sortedCategories.length > 3) {
      const otherCategories = sortedCategories.slice(3, 10).map((category) => category[0])
      const shopLikes = await LikesService.getLikesByUser(buyer_id, 'shops')
      for (const like of shopLikes) {
        if (like.shop_id) {
          const shopProducts = await ProductsService.getCommunityProductsWithFilter({
            community_id,
            wheres: [
              ['product_category', 'in', otherCategories],
              ['shop_id', '==', like.shop_id],
            ],
          })
          recommendedShopProducts.push(...shopProducts)
        }
      }
      recommendedShopProducts = recommendedShopProducts.filter(
        (p) => !recommendedProductsIds.includes(p.id)
      )
    }

    products = getScheduledAvailableItems(recommendedProducts, 'availability')
    moreProducts = getScheduledAvailableItems(recommendedShopProducts, 'availability')
  }

  return res.status(200).json({ status: 'ok', data: [...products, ...moreProducts] })
}

export default getRecommendedProducts

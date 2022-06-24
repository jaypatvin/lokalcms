import { RequestHandler } from 'express'
import { OrdersService, ProductReviewsService } from '../../../service'
import { generateError, ErrorCode, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/orders/{orderId}/products/{productId}/review:
 *   post:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: document id of the order
 *         schema:
 *           type: string
 *     description: |
 *       ### This will add or update a product review
 *       # Example
 *       ```
 *       {
 *         "message": "The cake is so delicious! Will order again.",
 *         "rating": 5
 *       }
 *       ```
 *
 *       ```
 *       {
 *         "rating": 3
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               rating:
 *                 type: number
 *                 required: true
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const addOrderProductReview: RequestHandler = async (req, res) => {
  const { productId, orderId } = req.params
  const { message = '', rating } = req.body
  const requestorDocId = res.locals.userDoc.id ?? 'mNgwHg5gmWNSisyX8vpe'

  const order = await OrdersService.getOrderByID(orderId)

  if (!order) {
    throw generateNotFoundError(ErrorCode.OrderApiError, 'Order', orderId)
  }

  if (!order.product_ids.includes(productId)) {
    throw generateError(ErrorCode.OrderApiError, {
      message: `The product ${productId} is not included on the order ${orderId}`,
    })
  }

  const existingReview = await ProductReviewsService.getProductReviewByOrderId(productId, orderId)

  if (existingReview.length) {
    const review = existingReview[0]
    if (review.user_id !== requestorDocId) {
      throw generateError(ErrorCode.OrderApiError, {
        message: 'The requestor id does not match the user id of the review.',
      })
    }
    await ProductReviewsService.updateProductReview(productId, review.id, rating, message)
  } else {
    const newReview = {
      user_id: requestorDocId,
      message,
      rating,
      order_id: orderId,
      product_id: productId,
      shop_id: order.shop_id,
      community_id: order.community_id,
      seller_id: order.seller_id,
    }
    const review = await ProductReviewsService.createProductReview(productId, newReview)
    const updatedOrderProducts = order.products.map((product) => {
      if (product.id === productId) {
        product.review_id = review.id
      }
      return product
    })
    await OrdersService.updateOrder(orderId, {
      products: updatedOrderProducts,
    })
  }

  return res.status(200).json({ status: 'ok' })
}

export default addOrderProductReview

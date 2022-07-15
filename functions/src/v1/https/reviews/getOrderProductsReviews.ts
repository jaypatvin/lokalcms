import { RequestHandler } from 'express'
import { Review } from '../../../models'
import { OrdersService, ProductReviewsService } from '../../../service'
import { ErrorCode, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/orders/{orderId}/reviews:
 *   get:
 *     tags:
 *       - reviews
 *     security:
 *       - bearerAuth: []
 *     description: Return the product reviews of the order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: document id of the order
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of product reviews of the order
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
const getOrderProductsWithReviews: RequestHandler = async (req, res) => {
  const { orderId } = req.params

  const order = await OrdersService.findById(orderId)

  if (!order) {
    throw generateNotFoundError(ErrorCode.ReviewApiError, 'Order', orderId)
  }

  const products: any = []

  for (const product of order.products) {
    let review: (Review & { id: string }) | null = null
    if (product.review_id) {
      review = await ProductReviewsService.findProductReview(product.id, product.review_id)
    }
    products.push({
      ...product,
      review,
    })
  }

  return res.json({ status: 'ok', data: products })
}

export default getOrderProductsWithReviews

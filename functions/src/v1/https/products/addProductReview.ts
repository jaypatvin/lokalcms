import { Request, Response } from 'express'
import { OrdersService, ProductReviewsService } from '../../../service'

/**
 * @openapi
 * /v1/products/{productId}/reviews:
 *   post:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     description: |
 *       ### This will add or update a product review
 *       # Example
 *       ```
 *       {
 *         "order_id": "id-of-order-that-have-this-product",
 *         "message": "The cake is so delicious! Will order again."
 *       }
 *       ```
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mesage:
 *                 type: string
 *               order_id:
 *                 type: string
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
const addProductReview = async (req: Request, res: Response) => {
  const { productId } = req.params
  const { message, order_id } = req.body
  const requestorDocId = res.locals.userDoc.id || 'ROi3hEkD1qJVmrGuoJR0'

  if (!order_id) {
    return res.status(400).json({ status: 'error', message: 'order_id is required.' })
  }

  if (!message) {
    return res.status(400).json({ status: 'error', message: 'message is required.' })
  }

  const order = await OrdersService.getOrderByID(order_id)

  if (!order.product_ids.includes(productId)) {
    return res
      .status(400)
      .json({
        status: 'error',
        message: `The product ${productId} is not included on the order ${order_id}`,
      })
  }

  const existingReview = await ProductReviewsService.getProductReviewByOrderId(productId, order_id)

  if (existingReview.length) {
    const review = existingReview[0]
    if (review.user_id !== requestorDocId) {
      return res.status(400).json({
        status: 'error',
        message: 'The requestor id does not match the user id of the review.',
      })
    }
    await ProductReviewsService.updateProductReview(productId, review.id, message)
  } else {
    const newRating = {
      user_id: requestorDocId,
      message,
      order_id,
    }
    await ProductReviewsService.createProductReview(productId, newRating)
  }

  return res.status(200).json({ status: 'ok' })
}

export default addProductReview

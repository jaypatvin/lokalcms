import { RequestHandler } from 'express'
import { ProductReviewsService } from '../../../service'

/**
 * @openapi
 * /v1/products/{productId}/reviews:
 *   get:
 *     tags:
 *       - reviews
 *     security:
 *       - bearerAuth: []
 *     description: Return the product reviews
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews for the product
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
 *                     $ref: '#/components/schemas/Review'
 */
const getProductReviews: RequestHandler = async (req, res) => {
  const { productId } = req.params

  const reviews = await ProductReviewsService.getAllProductReviews(productId)

  return res.json({ status: 'ok', data: reviews })
}

export default getProductReviews

import { RequestHandler } from 'express'
import { ProductReviewsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/reviews:
 *   get:
 *     tags:
 *       - reviews
 *     security:
 *       - bearerAuth: []
 *     description: Return the user reviews
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reviews of the user
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
const getUserReviews: RequestHandler = async (req, res) => {
  const { userId } = req.params

  const reviews = await ProductReviewsService.findReviewsByUser(userId)

  return res.json({ status: 'ok', data: reviews })
}

export default getUserReviews

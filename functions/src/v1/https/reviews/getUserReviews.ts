import { Request, Response } from 'express'
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
const getUserReviews = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'userId is required!' })
  }

  const reviews = await ProductReviewsService.getReviewsByUser(userId)

  return res.json({ status: 'ok', data: reviews })
}

export default getUserReviews

import { Request, Response } from 'express'
import { ProductRatingsService } from '../../../service'

/**
 * @openapi
 * /v1/products/{productId}/ratings:
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
 *     description: Create new rating for the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: number
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
const updateProductRating = async (req: Request, res: Response) => {
  const { productId } = req.params
  const { value, order_id } = req.body
  const requestorDocId = res.locals.userDoc.id

  if (!value || !order_id) {
    return res.status(400).json({ status: 'error', message: 'value and order_id is required.' })
  }

  if (!isFinite(value) || value < 1 || value > 5) {
    return res.status(400).json({ status: 'error', message: 'the value must be between 1 and 5' })
  }

  const existingRating = await ProductRatingsService.getProductRatingByOrderId(productId, order_id)

  if (existingRating.length) {
    const rating = existingRating[0]
    if (rating.user_id !== requestorDocId) {
      return res
        .status(400)
        .json({
          status: 'error',
          message: 'The requestor id does not match the user id of the rating.',
        })
    }
    await ProductRatingsService.updateProductRating(productId, rating.id, value)
  } else {
    const newRating = {
      user_id: requestorDocId,
      value,
      order_id,
    }
    await ProductRatingsService.createProductRating(productId, newRating)
  }

  return res.status(200).json({ status: 'ok' })
}

export default updateProductRating

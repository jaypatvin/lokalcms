import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/shops:
 *   get:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Return the shops of the user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of shops of the user
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
 *                     $ref: '#/components/schemas/Shop'
 */
const getUserShops = async (req: Request, res: Response) => {
  const { userId } = req.params

  const shops = await ShopsService.getShopsByUserID(userId)

  // reduce return data
  shops.forEach((shop) => {
    delete shop.keywords
  })

  return res.json({ status: 'ok', data: shops })
}

export default getUserShops

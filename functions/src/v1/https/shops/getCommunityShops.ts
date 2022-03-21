import { RequestHandler } from 'express'
import { ShopsService } from '../../../service'

/**
 * @openapi
 * /v1/community/{communityId}/shops:
 *   get:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Return the shops of the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of shops of the community
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
const getCommunityShops: RequestHandler = async (req, res) => {
  const { communityId } = req.params

  const shops = await ShopsService.getShopsByCommunityID(communityId)

  // reduce return data
  shops.forEach((shop) => {
    delete shop.keywords
  })

  return res.json({ status: 'ok', data: shops })
}

export default getCommunityShops

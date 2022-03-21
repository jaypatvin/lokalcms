import { RequestHandler } from 'express'
import { LikesService, ShopsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/shops/{shopId}/unlike:
 *   delete:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Like a shop
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string

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
const unlikeShop: RequestHandler = async (req, res) => {
  const { shopId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Shop', shopId)
  }
  if (shop.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Shop with id "${shopId}" is currently archived`,
    })
  }

  const exists = await LikesService.getShopLike(shopId, requestorDocId)
  if (exists) {
    await LikesService.removeShopLike(shopId, requestorDocId)
  }

  return res.status(200).json({ status: 'ok' })
}

export default unlikeShop

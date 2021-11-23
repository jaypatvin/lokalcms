import { Request, Response } from 'express'
import { LikesService, ShopsService } from '../../../service'

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
const unlikeShop = async (req: Request, res: Response) => {
  const { shopId } = req.params
  const requestorDocId = res.locals.userDoc.id

  if (!shopId) {
    return res.status(400).json({ status: 'error', message: 'shop id is required!' })
  }
  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) {
    return res.status(400).json({ status: 'error', message: 'Shop does not exist!' })
  }
  if (shop.archived) {
    return res.status(400).json({
      status: 'error',
      message: `Shop with id ${shopId} is currently archived!`,
    })
  }

  const exists = await LikesService.getShopLike(shopId, requestorDocId)
  if (exists) {
    await LikesService.removeShopLike(shopId, requestorDocId)
  }

  return res.status(200).json({ status: 'ok' })
}

export default unlikeShop

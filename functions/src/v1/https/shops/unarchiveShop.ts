import { RequestHandler } from 'express'
import { ShopsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/shops/{shopId}/unarchive:
 *   put:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the shop
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unarchived shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unarchiveShop: RequestHandler = async (req, res) => {
  const data = req.body
  const { shopId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) {
    throw generateNotFoundError(ErrorCode.ShopApiError, 'Shop', shopId)
  }

  if (!roles.admin && requestorDocId !== shop.user_id) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'User does not have a permission to unarchive a shop of another user',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await ShopsService.unarchiveShop(shopId, requestData)

  return res.json({ status: 'ok', data: result })
}

export default unarchiveShop

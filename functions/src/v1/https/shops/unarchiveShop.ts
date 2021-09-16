import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

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
const unarchiveShop = async (req: Request, res: Response) => {
  const data = req.body
  const { shopId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  const _shop = await ShopsService.getShopByID(shopId)

  if (!_shop) return res.status(403).json({ status: 'error', message: 'Shop does not exist!' })

  if (!roles.admin && requestorDocId !== _shop.user_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to unarchive a shop of another user.',
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

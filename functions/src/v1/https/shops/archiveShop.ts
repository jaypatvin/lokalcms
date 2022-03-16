import { RequestHandler } from 'express'
import { ProductsService, ShopsService } from '../../../service'
import { ErrorCode, generateError, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/shops/{shopId}:
 *   delete:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Archive the shop
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const archiveShop: RequestHandler = async (req, res, next) => {
  const data = req.body
  const { shopId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) {
    return next(generateNotFoundError(ErrorCode.ShopApiError, 'Shop', shopId))
  }

  if (!roles.admin && requestorDocId !== shop.user_id) {
    return next(
      generateError(ErrorCode.ShopApiError, {
        message: 'User does not have a permission to delete a shop of another user',
      })
    )
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await ShopsService.archiveShop(shopId, requestData)

  // archive the products of the shop
  await ProductsService.archiveShopProducts(shopId)

  return res.json({ status: 'ok', data: result })
}

export default archiveShop

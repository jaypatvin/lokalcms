import { RequestHandler } from 'express'
import { ReportCreateData } from '../../../models/Report'
import { ShopsService, ReportsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/shops/{shopId}/report:
 *   post:
 *     tags:
 *       - reports
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will report a shop
 *       # Examples
 *       ```
 *       {
 *         "description": "this shop is selling some illegal stuffs!"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 required: true
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
const reportShop: RequestHandler = async (req, res) => {
  const { shopId } = req.params
  const { description } = req.body
  const requestor = res.locals.userDoc

  const shop = await ShopsService.getShopByID(shopId)
  if (!shop) {
    throw generateNotFoundError(ErrorCode.ShopApiError, 'Shop', shopId)
  }
  if (shop.archived) {
    throw generateError(ErrorCode.ShopApiError, {
      message: `Shop with id ${shopId} is currently archived`,
    })
  }

  if (requestor.id === shop.user_id) {
    throw generateError(ErrorCode.ShopApiError, {
      message: 'Cannot report own shop',
    })
  }

  const updateData: ReportCreateData = {
    description,
    user_id: requestor.id,
    reported_user_id: shop.user_id,
    shop_id: shopId,
    community_id: shop.community_id,
  }

  const result = await ReportsService.createShopReport(shopId, updateData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default reportShop

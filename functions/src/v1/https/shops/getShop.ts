import { RequestHandler } from 'express'
import { omit } from 'lodash'
import { ShopsService, ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/shops/{shopId}:
 *   get:
 *     tags:
 *       - shops
 *     security:
 *       - bearerAuth: []
 *     description: Return the shop
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the shop
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single shop
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Shop'
 */
const getShop: RequestHandler = async (req, res) => {
  const { shopId } = req.params

  const shop = await ShopsService.findById(shopId)

  if (!shop) {
    throw generateNotFoundError(ErrorCode.ShopApiError, 'Shop', shopId)
  }

  const products = (await ProductsService.findProductsByShopId(shopId)).map((product) =>
    omit(product, ['keywords'])
  )

  const result = { ...omit(shop, ['keywords']), products }

  return res.json({ status: 'ok', data: result })
}

export default getShop

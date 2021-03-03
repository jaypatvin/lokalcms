import { Request, Response } from 'express'
import { ShopsService, ProductsService } from '../../../service'

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
const getShop = async (req: Request, res: Response) => {
  const { shopId } = req.params

  if (!shopId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const shop = await ShopsService.getShopByID(shopId)

  if (!shop) return res.status(404).json({ status: 'error', data: shop, message: 'Shop does not exist!' })

  const products = await ProductsService.getProductsByShopID(shopId)

  // reduce return data
  delete shop.keywords
  products.forEach((product) => delete product.keywords)
  shop.products = products

  return res.json({ status: 'ok', data: shop })
}

export default getShop

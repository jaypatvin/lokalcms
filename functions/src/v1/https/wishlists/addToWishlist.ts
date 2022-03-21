import { RequestHandler } from 'express'
import { WishlistsService, ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}/wishlist:
 *   post:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Add product to wishlist
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
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
const addToWishlist: RequestHandler = async (req, res) => {
  const { productId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const product = await ProductsService.getProductByID(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.WishlistApiError, 'Product', productId)
  }
  if (product.archived) {
    throw generateError(ErrorCode.WishlistApiError, {
      message: `Product with id "${productId}" is currently archived`,
    })
  }

  const exists = await WishlistsService.getProductWishlist(productId, requestorDocId)
  if (!exists) {
    const wishlistData = {
      shop_id: product.shop_id,
      community_id: product.community_id,
    }
    await WishlistsService.addProductWishlist(productId, requestorDocId, wishlistData)
  }

  return res.status(200).json({ status: 'ok' })
}

export default addToWishlist

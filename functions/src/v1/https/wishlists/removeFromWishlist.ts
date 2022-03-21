import { RequestHandler } from 'express'
import { WishlistsService, ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}/wishlist:
 *   delete:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Remove a product from the wishlist
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
const removeFromWishlist: RequestHandler = async (req, res) => {
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
  if (exists) {
    await WishlistsService.removeProductWishlist(productId, requestorDocId)
  }

  return res.status(200).json({ status: 'ok' })
}

export default removeFromWishlist

import { Request, Response } from 'express'
import { WishlistsService, ProductsService, UsersService } from '../../../service'

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
const removeFromWishlist = async (req: Request, res: Response) => {
  const { productId } = req.params
  const requestorDocId = res.locals.userDoc.id

  if (!productId) {
    return res.status(400).json({ status: 'error', message: 'product id is required!' })
  }
  const product = await ProductsService.getProductByID(productId)
  if (!product) {
    return res.status(400).json({ status: 'error', message: 'Product does not exist!' })
  }
  if (product.archived) {
    return res.status(400).json({
      status: 'error',
      message: `Product with id ${productId} is currently archived!`,
    })
  }

  const exists = await WishlistsService.getProductWishlist(productId, requestorDocId)
  if (exists) {
    await WishlistsService.removeProductWishlist(productId, requestorDocId)
  }

  return res.status(200).json({ status: 'ok' })
}

export default removeFromWishlist
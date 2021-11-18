import { Request, Response } from 'express'
import { ProductsService, WishlistsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/wishlist:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Return the wishlist of the user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products on the wishlist of the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
const getUserWishlist = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId) {
    return res.status(400).json({ status: 'error', message: 'userId is required!' })
  }

  const wishlist = await WishlistsService.getWishlistsByUser(userId)
  const wishlistProducts = []

  for (const { product_id } of wishlist) {
    const product = await ProductsService.getProductByID(product_id)
    if (product) {
      wishlistProducts.push(product)
    }
  }

  // reduce return data
  wishlistProducts.forEach((product) => {
    delete product.keywords
  })

  return res.json({ status: 'ok', data: wishlistProducts })
}

export default getUserWishlist

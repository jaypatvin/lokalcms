import { Request, Response } from 'express'
import { uniqBy } from 'lodash'
import { UsersService, WishlistsService } from '../../../service'

/**
 * @openapi
 * /v1/shops/{shopId}/wishlist:
 *   get:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Return the users who wishlisted any product of the shop
 *     parameters:
 *       - in: path
 *         name: shopId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users who wishlisted any product of the shop
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
 *                     $ref: '#/components/schemas/User'
 */
const getShopWishlistUsers = async (req: Request, res: Response) => {
  const { shopId } = req.params

  if (!shopId) {
    return res.status(400).json({ status: 'error', message: 'shopId is required!' })
  }

  const wishlist = await WishlistsService.getWishlistsByShop(shopId)
  const filteredWishlist = uniqBy(wishlist, 'user_id')
  const wishlistUsers = []

  for (const { user_id } of filteredWishlist) {
    const user = await UsersService.getUserByID(user_id)
    if (user) {
      wishlistUsers.push(user)
    }
  }

  // reduce return data
  wishlistUsers.forEach((user) => {
    delete user.keywords
  })

  return res.json({ status: 'ok', data: wishlistUsers })
}

export default getShopWishlistUsers

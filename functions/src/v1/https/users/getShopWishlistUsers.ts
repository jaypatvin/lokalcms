import { RequestHandler } from 'express'
import { omit, uniqBy } from 'lodash'
import { User } from '../../../models'
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
const getShopWishlistUsers: RequestHandler = async (req, res) => {
  const { shopId } = req.params

  const wishlist = await WishlistsService.findWishlistsByShop(shopId)
  const filteredWishlist = uniqBy(wishlist, 'user_id')
  const wishlistUsers: ({
    id: string
  } & User)[] = []

  for (const { user_id } of filteredWishlist) {
    const user = await UsersService.findById(user_id)
    if (user) {
      wishlistUsers.push(user)
    }
  }

  return res.json({ status: 'ok', data: wishlistUsers.map((user) => omit(user, ['keywords'])) })
}

export default getShopWishlistUsers

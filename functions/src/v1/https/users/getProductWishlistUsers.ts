import { RequestHandler } from 'express'
import { omit } from 'lodash'
import { User } from '../../../models'
import { UsersService, WishlistsService } from '../../../service'

/**
 * @openapi
 * /v1/products/{productId}/wishlist:
 *   get:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Return the users who wishlisted the product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users who wishlisted the product
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
const getProductWishlistUsers: RequestHandler = async (req, res) => {
  const { productId } = req.params

  const wishlist = await WishlistsService.findAllProductWishlists(productId)
  const wishlistUsers: ({
    id: string
  } & User)[] = []

  for (const { user_id } of wishlist) {
    const user = await UsersService.findById(user_id)
    if (user) {
      wishlistUsers.push(user)
    }
  }

  return res.json({ status: 'ok', data: wishlistUsers.map((user) => omit(user, ['keywords'])) })
}

export default getProductWishlistUsers

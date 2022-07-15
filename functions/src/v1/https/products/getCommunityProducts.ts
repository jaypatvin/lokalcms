import { RequestHandler } from 'express'
import { omit } from 'lodash'
import { ProductsService, LikesService } from '../../../service'

/**
 * @openapi
 * /v1/community/{communityId}/products:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Return the products of the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products of the community
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
const getCommunityProducts: RequestHandler = async (req, res) => {
  const { communityId } = req.params

  const products = await ProductsService.findByCommunityId(communityId)

  const result: (typeof products[0] & { likes: string[] })[] = []

  for (const rawProduct of products) {
    const product = omit(rawProduct, ['keywords'])
    const likes = await LikesService.findAllProductLikes(product.id)
    const likeUsers = likes.map((like) => like.user_id)
    // @ts-ignore: ts bug?
    result.push({ ...product, likes: likeUsers })
  }

  return res.json({ status: 'ok', data: result })
}

export default getCommunityProducts

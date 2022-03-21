import { RequestHandler } from 'express'
import { ProductsService } from '../../../service'
import { getProductLikes } from '../../../service/likes'

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

  const products = await ProductsService.getProductsByCommunityID(communityId)

  const result = []

  for (const product of products) {
    delete product.keywords
    const likes = await getProductLikes(product.id)
    const likeUsers = likes.map((like) => like.user_id)
    result.push({ ...product, likes: likeUsers })
  }

  return res.json({ status: 'ok', data: result })
}

export default getCommunityProducts

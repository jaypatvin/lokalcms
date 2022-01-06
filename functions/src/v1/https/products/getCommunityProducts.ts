import { Request, Response } from 'express'
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
const getCommunityProducts = async (req: Request, res: Response) => {
  const { communityId } = req.params

  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'communityId is required!' })

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

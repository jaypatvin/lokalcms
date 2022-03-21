import { RequestHandler } from 'express'
import { LikesService, ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}/unlike:
 *   delete:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Like a product
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
const unlikeProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const product = await ProductsService.getProductByID(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Product', productId)
  }
  if (product.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Product with id "${productId}" is currently archived`,
    })
  }

  const exists = await LikesService.getProductLike(productId, requestorDocId)
  if (exists) {
    await LikesService.removeProductLike(productId, requestorDocId)
  }

  return res.status(200).json({ status: 'ok' })
}

export default unlikeProduct

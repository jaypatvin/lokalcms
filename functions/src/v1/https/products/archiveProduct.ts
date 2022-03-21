import { RequestHandler } from 'express'
import { ProductUpdateData } from '../../../models/Product'
import { ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}:
 *   delete:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Archive the product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const archiveProduct: RequestHandler = async (req, res) => {
  const data = req.body
  const { productId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const product = await ProductsService.getProductByID(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Product', productId)
  }

  if (!roles.admin && requestorDocId !== product.user_id) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'User does not have a permission to delete a product of another user',
    })
  }

  const requestData: ProductUpdateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await ProductsService.archiveProduct(productId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveProduct

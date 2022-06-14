import { RequestHandler } from 'express'
import { ReportCreateData } from '../../../models/Report'
import { ProductsService, ReportsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}/report:
 *   post:
 *     tags:
 *       - report
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will report a product
 *       # Examples
 *       ```
 *       {
 *         "description": "this product looks offending!"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 required: true
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
const reportProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params
  const { description } = req.body
  const requestor = res.locals.userDoc

  const product = await ProductsService.getProductByID(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Product', productId)
  }
  if (product.archived) {
    throw generateError(ErrorCode.ProductApiError, {
      message: `Product with id ${productId} is currently archived`,
    })
  }

  if (requestor.id === product.user_id) {
    throw generateError(ErrorCode.ProductApiError, {
      message: 'Cannot report own product',
    })
  }

  const updateData: ReportCreateData = {
    description,
    user_id: requestor.id,
    reported_user_id: product.user_id,
    product_id: productId,
  }

  const result = await ReportsService.createProductReport(productId, updateData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default reportProduct

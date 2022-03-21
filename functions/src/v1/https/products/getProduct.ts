import { RequestHandler } from 'express'
import { ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/products/{productId}:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Return the product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: document id of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
const getProduct: RequestHandler = async (req, res) => {
  const { productId } = req.params

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) {
    throw generateNotFoundError(ErrorCode.ProductApiError, 'Product', productId)
  }

  // reduce return data
  delete product.keywords

  return res.status(200).json({ status: 'ok', data: product })
}

export default getProduct

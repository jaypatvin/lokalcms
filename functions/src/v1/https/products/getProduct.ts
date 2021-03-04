import { Request, Response } from 'express'
import { ProductsService } from '../../../service'


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
const getProduct = async (req: Request, res: Response) => {
  const { productId } = req.params

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) return res.status(404).json({ status: 'error', message: 'Product does not exist!' })

  // reduce return data
  delete product.keywords

  return res.status(200).json({ status: 'ok', data: product })
}

export default getProduct

import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

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
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 */
const archiveProduct = async (req: Request, res: Response) => {
  const { productId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId
  const _product = await ProductsService.getProductByID(productId)

  if (!_product) return res.status(403).json({ status: 'error', message: 'Product does not exist!' })

  if (!roles.admin && requestorDocId !== _product.user_id) {
    return res
      .status(403)
      .json({
        status: 'error',
        message: 'You do not have a permission to delete.',
      })
  }

  const result = await ProductsService.archiveProduct(productId)
  return res.json({ status: 'ok', data: result })
}

export default archiveProduct

import { Request, Response } from 'express'

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
const deleteProduct = async (req: Request, res: Response) => {
  const roles = res.locals.userRoles
  if (!roles.admin) {
    return res
      .status(403)
      .json({
        status: 'error',
        message: 'You do not have a permission to delete.',
      })
  }
  return res.json({ status: 'ok' })
}

export default deleteProduct

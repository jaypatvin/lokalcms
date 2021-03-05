import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/products:
 *   get:
 *     tags:
 *       - products
 *     security:
 *       - bearerAuth: []
 *     description: Return the products of the user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products of the user
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
const getUserProducts = async (req: Request, res: Response) => {
  const data = req.body
  const { userId } = req.params

  if (!userId)
    return res.status(400).json({ status: 'error', message: 'userId is required!' })

  const products = await ProductsService.getProductsByUserId(userId)

  // reduce return data
  products.forEach((product) => {
    delete product.keywords
  })

  return res.json({ status: 'ok', data: products })
}

export default getUserProducts
import { RequestHandler } from 'express'
import { omit } from 'lodash'
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
const getUserProducts: RequestHandler = async (req, res) => {
  const { userId } = req.params

  const products = await ProductsService.findProductsByUserId(userId)

  return res.json({ status: 'ok', data: omit(products, ['keywords']) })
}

export default getUserProducts

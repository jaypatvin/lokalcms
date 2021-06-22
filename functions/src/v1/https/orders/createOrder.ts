import { Request, Response } from 'express'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/orders:
 *   post:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: Create new order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 description: Array of products containing the id, quantity, and instruction
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: document id of the product
 *                     quantity:
 *                       type: number
 *                       description: how many of this product is in the order
 *                     instruction:
 *                       type: string
 *                       description: instruction or additional notes added by the buyer specifically for this product
 *               buyer_id:
 *                 type: string
 *                 description: document id of the user who is placing an order
 *               shop_id:
 *                 type: string
 *                 description: document id of the shop
 *               delivery_option:
 *                 type: string
 *                 description: either pickup or delivery
 *                 enum: [pickup, delivery]
 *               delivery_date:
 *                 type: string
 *                 format: date-time
 *                 description: datetime of delivery
 *               instruction:
 *                 type: string
 *                 description: instruction or additional notes for the whole order
 *     responses:
 *       200:
 *         description: The new order
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
const createOrder = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }
  const {
    products,
    buyer_id,
    shop_id,
    delivery_options,
    delivery_date,
    instruction
  } = data
  let requestorDocId = res.locals.userDoc.id
  if (roles.admin && buyer_id) {
    requestorDocId = buyer_id
  }

  return res.status(200).json({ status: 'ok' })
}

export default createOrder

import { Request, Response } from 'express'
import { OrdersService } from '../../../service'

/**
 * @openapi
 * /v1/orders/{orderId}/confirm:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: Confirm the order
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: document id of the order
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seller_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated order
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
const confirmOrder = async (req: Request, res: Response) => {
  const data = req.body
  const { seller_id } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id || seller_id

  const order = await OrdersService.getOrderByID(orderId)

  if (!order) return res.status(403).json({ status: 'error', message: `Order with id ${orderId} does not exist!` })

  const statusCode = parseInt(order.status_code)

  if (statusCode >= 200 || statusCode < 100) {
    return res
      .status(403)
      .json({ status: 'error', message: 'Cannot confirm the order due to the current order status' })
  }

  if (!roles.admin && order.seller_id !== requestorDocId)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to confirm the order',
    })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    status_code: 200,
  }

  const statusChange = {
    before: order.status_code,
    after: 200
  }

  const result = await OrdersService.updateOrder(orderId, requestData)

  await OrdersService.createOrderStatusHistory(orderId, statusChange)

  return res.json({ status: 'ok', data: result })
}

export default confirmOrder

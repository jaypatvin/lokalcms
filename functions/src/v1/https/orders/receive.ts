import { Request, Response } from 'express'
import { ORDER_STATUS } from '.'
import { OrdersService } from '../../../service'

/**
 * @openapi
 * /v1/orders/{orderId}/receive:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will progress the order from "Waiting to Receive" to "Finished"
 *       ### Buyer status will be changed from "To Receive" to "Past Order"
 *       ### Seller status will be changed from "Shipped Out" to "Past Order"
 *       ### if the payment_method is cod, the is_paid will now become true
 *       ## Note: the _buyer_id_ will be extracted from the firestore token.
 *       ## For testing purposes, you can use the order's buyer doc id as the _buyer_id_. But this will only work if the token is from an admin user.
 *       # Examples
 *       ## Buyer with doc id _user-id-1_ received the order _order-id-1_.
 *       ```
 *       {
 *         "buyer_id": "user-id-1"
 *       }
 *       ```
 *
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
 *               buyer_id:
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
const received = async (req: Request, res: Response) => {
  const data = req.body
  const { buyer_id } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id || buyer_id

  const order = await OrdersService.getOrderByID(orderId)

  if (!order)
    return res
      .status(403)
      .json({ status: 'error', message: `Order with id ${orderId} does not exist!` })

  const statusCode = parseInt(order.status_code)

  if (statusCode >= ORDER_STATUS.FINISHED || statusCode < ORDER_STATUS.PENDING_RECEIPT) {
    return res.status(403).json({
      status: 'error',
      message: 'Cannot receive due to the current order status',
    })
  }

  if (buyer_id && roles.admin) {
    requestorDocId = buyer_id
  }

  if (!roles.admin && order.buyer_id !== requestorDocId)
    return res.status(403).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the buyer from the order with id ${orderId}`,
    })

  const updateData: any = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    status_code: ORDER_STATUS.FINISHED,
  }

  if (order.payment_method === 'cod') {
    updateData.is_paid = true
  }
  if (!order.delivered_date) {
    updateData.delivered_date = new Date()
  }

  const statusChange = {
    before: order.status_code,
    after: ORDER_STATUS.FINISHED,
  }

  const result = await OrdersService.updateOrder(orderId, updateData)

  await OrdersService.createOrderStatusHistory(orderId, statusChange)

  return res.json({ status: 'ok', data: result })
}

export default received

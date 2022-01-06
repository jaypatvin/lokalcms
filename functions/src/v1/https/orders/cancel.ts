import { Request, Response } from 'express'
import { isNumber } from 'lodash'
import { ORDER_STATUS } from './index'
import { NotificationsService, OrdersService, ProductsService } from '../../../service'

/**
 * @openapi
 * /v1/orders/{orderId}/cancel:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will progress the order status to "Cancelled"
 *       ### Buyer status will be changed to "Cancelled Order"
 *       ### Seller status will be changed to "Cancelled Order"
 *       ## Note: the _buyer_id_ will be extracted from the firestore token.
 *       ## For testing purposes, you can use the shop's owner doc id as the _buyer_id_. But this will only work if the token is from an admin user.
 *       # Examples
 *       ## Buyer with doc id _user-id-1_ cancelled the order _order-id-1_, indicating why the buyer cancelled
 *       ```
 *       {
 *         "buyer_id": "user-id-1",
 *         "reason": "I noticed I dont have money"
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
 *               reason:
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
 */
const declineOrder = async (req: Request, res: Response) => {
  const data = req.body
  const { buyer_id, reason = '' } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id || buyer_id

  const order = await OrdersService.getOrderByID(orderId)

  if (!order)
    return res
      .status(403)
      .json({ status: 'error', message: `Order with id ${orderId} does not exist!` })

  const statusCode = !isNumber(order.status_code) ? parseInt(order.status_code) : order.status_code

  if (statusCode >= ORDER_STATUS.PENDING_CONFIRM_PAYMENT) {
    return res.status(403).json({
      status: 'error',
      message: 'Cannot cancel anymore since the order payment was already confirmed',
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

  const updateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    status_code: ORDER_STATUS.CANCELLED,
    cancellation_reason: reason,
  }

  const statusChange = {
    before: order.status_code,
    after: ORDER_STATUS.CANCELLED,
  }

  for (const orderProduct of order.products) {
    await ProductsService.incrementProductQuantity(orderProduct.product_id, orderProduct.quantity)
  }
  const result = await OrdersService.updateOrder(orderId, updateData)

  await OrdersService.createOrderStatusHistory(orderId, statusChange)

  const notificationData = {
    type: 'order_status',
    title: 'Order cancelled',
    message: `The order (${order.products.length} products) has been cancelled.`,
    associated_collection: 'orders',
    associated_document: orderId,
  }

  await NotificationsService.createUserNotification(order.seller_id, notificationData)

  return res.json({ status: 'ok', data: result })
}

export default declineOrder

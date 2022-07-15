import { RequestHandler } from 'express'
import { isNumber } from 'lodash'
import { ORDER_STATUS } from '.'
import { OrderUpdateData } from '../../../models/Order'
import { NotificationsService, OrdersService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/orders/{orderId}/confirmPayment:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will progress the order from "Confirming Payment" to "Shipping Out"
 *       ### Buyer status will be changed from "Waiting to Confirm Payment" to "Waiting for Delivery"
 *       ### Seller status will be changed from "Payment Received" to "To Ship"
 *       ### If the payment_method is not cod, the is_paid will be true. Otherwise, will be false
 *       ## Note: the _seller_id_ will be extracted from the firestore token.
 *       ## For testing purposes, you can use the shop's owner doc id as the _seller_id_. But this will only work if the token is from an admin user.
 *       # Examples
 *       ## Seller with doc id _user-id-1_ confirming the payment for _order-id-1_. The _orderId_ from the url should be _order-id-1_
 *       ```
 *       {
 *         "seller_id": "user-id-1"
 *       }
 *       ```
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
 */
const confirmPayment: RequestHandler = async (req, res) => {
  const data = req.body
  const { seller_id } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id || seller_id

  const order = await OrdersService.findById(orderId)
  if (!order) {
    throw generateNotFoundError(ErrorCode.OrderApiError, 'Order', orderId)
  }

  const statusCode = !isNumber(order.status_code) ? parseInt(order.status_code) : order.status_code

  if (
    statusCode >= ORDER_STATUS.PENDING_SHIPMENT ||
    statusCode < ORDER_STATUS.PENDING_CONFIRM_PAYMENT
  ) {
    throw generateError(ErrorCode.OrderApiError, {
      message: 'Cannot confirm the order due to the current order status',
    })
  }

  if (seller_id && roles.admin) {
    requestorDocId = seller_id
  }

  if (!roles.admin && order.seller_id !== requestorDocId) {
    throw generateError(ErrorCode.OrderApiError, {
      message: `User with id ${requestorDocId} is not the seller from the order with id ${orderId}`,
    })
  }

  const updateData: OrderUpdateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    status_code: ORDER_STATUS.PENDING_SHIPMENT,
  }

  if (order.payment_method !== 'cod') {
    updateData.is_paid = true
  }

  const result = await OrdersService.update(orderId, updateData)

  const notificationData = {
    type: 'order_status',
    title: 'Your payment has been confirmed',
    message: `Your payment has been confirmed for your order (${order.products.length} products) from ${order.shop.name}. Please wait for the shipment of you order.`,
    associated_collection: 'orders',
    associated_document: orderId,
  }

  await NotificationsService.create(order.buyer_id, notificationData)

  return res.json({ status: 'ok', data: result })
}

export default confirmPayment

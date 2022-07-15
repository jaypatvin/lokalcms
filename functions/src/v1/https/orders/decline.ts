import { RequestHandler } from 'express'
import { isNumber } from 'lodash'
import { ORDER_STATUS } from './index'
import { NotificationsService, OrdersService, ProductsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/orders/{orderId}/decline:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will progress the order status to "Declined"
 *       ### Buyer status will be changed "Declined Order"
 *       ### Seller status will be changed "Declined Order"
 *       ## Note: the _seller_id_ will be extracted from the firestore token.
 *       ## For testing purposes, you can use the shop's owner doc id as the _seller_id_. But this will only work if the token is from an admin user.
 *       # Examples
 *       ## Seller with doc id _user-id-1_ declining the order _order-id-1_, indicating why the seller declined
 *       ```
 *       {
 *         "seller_id": "user-id-1",
 *         "reason": "I do not want to make u a cake"
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               seller_id:
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
const declineOrder: RequestHandler = async (req, res) => {
  const data = req.body
  const { seller_id, reason = '' } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id || seller_id

  const order = await OrdersService.findById(orderId)
  if (!order) {
    throw generateNotFoundError(ErrorCode.OrderApiError, 'Order', orderId)
  }

  const statusCode = !isNumber(order.status_code) ? parseInt(order.status_code) : order.status_code

  if (statusCode >= ORDER_STATUS.PENDING_CONFIRM_PAYMENT) {
    throw generateError(ErrorCode.OrderApiError, {
      message: 'Cannot decline anymore since the order payment was already confirmed',
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

  const updateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    status_code: ORDER_STATUS.DECLINED,
    decline_reason: reason,
  }

  for (const orderProduct of order.products) {
    await ProductsService.incrementProductQuantity(orderProduct.id, orderProduct.quantity)
  }
  const result = await OrdersService.update(orderId, updateData)

  const notificationData = {
    type: 'order_status',
    title: 'Your order has been declined',
    message: `Your order (${order.products.length} products) from ${order.shop.name} has been declined.`,
    associated_collection: 'orders',
    associated_document: orderId,
  }

  await NotificationsService.create(order.buyer_id, notificationData)

  return res.json({ status: 'ok', data: result })
}

export default declineOrder

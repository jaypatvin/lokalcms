import { Request, Response } from 'express'
import { includes } from 'lodash'
import { ORDER_STATUS, payment_methods } from '.'
import { NotificationsService, OrdersService } from '../../../service'

/**
 * @openapi
 * /v1/orders/{orderId}/pay:
 *   put:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will progress the order from "Payment" to "Cofirm Payment"
 *       ### Buyer status will be changed from "To Pay" to "Waiting to Confirm Payment"
 *       ### Seller status will be changed from "Waiting for Payment" to "Payment Received"
 *       ## Note: the _buyer_id_ will be extracted from the firestore token.
 *       ## For testing purposes, you can use the order's buyer doc id as the _buyer_id_. But this will only work if the token is from an admin user.
 *       # Examples
 *       ## Buyer with doc id _user-id-1_ paying for the order _order-id-1_. The method of payment is cod
 *       ```
 *       {
 *         "buyer_id": "user-id-1",
 *         "payment_method": "cod"
 *       }
 *       ```
 *
 *       ## Buyer with doc id _user-id-1_ paying for the order _order-id-1_. The method of payment is thru bank and must have a proof of payment
 *       ```
 *       {
 *         "buyer_id": "user-id-1",
 *         "payment_method": "bank",
 *         "proof_of_payment": "https://image.shutterstock.com/image-vector/sample-stamp-grunge-texture-vector-260nw-1389188336.jpg"
 *       }
 *       ```
 *
 *
 *       ## Buyer with doc id _user-id-1_ paying for the order _order-id-1_. The method of payment is thru e-wallet and must have a proof of payment
 *       ```
 *       {
 *         "buyer_id": "user-id-1",
 *         "payment_method": "e-wallet",
 *         "proof_of_payment": "https://image.shutterstock.com/image-vector/sample-stamp-grunge-texture-vector-260nw-1389188336.jpg"
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
 *               payment_method:
 *                 type: string
 *                 required: true
 *                 enum: [cod, bank, e-wallet]
 *               proof_of_payment:
 *                 type: string
 *                 description: image url of the uploaded proof of payment
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
const pay = async (req: Request, res: Response) => {
  const data = req.body
  const { buyer_id, payment_method, proof_of_payment } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id || buyer_id

  if (!payment_method) {
    return res
      .status(403)
      .json({ status: 'error', message: 'payment_method is required. "cod" | "bank" | "e-wallet"' })
  }
  if (!includes(payment_methods, payment_method)) {
    return res.status(403).json({
      status: 'error',
      message: `${payment_method} is not a valid payment_method. "cod" | "bank" | "e-wallet"`,
    })
  }
  if (payment_method !== 'cod' && !proof_of_payment) {
    return res.status(403).json({
      status: 'error',
      message:
        'proof_of_payment is required. This should be the image url of the uploaded proof of payment',
    })
  }

  const order = await OrdersService.getOrderByID(orderId)

  if (!order)
    return res
      .status(403)
      .json({ status: 'error', message: `Order with id ${orderId} does not exist!` })

  const statusCode = parseInt(order.status_code)

  if (
    statusCode >= ORDER_STATUS.PENDING_CONFIRM_PAYMENT ||
    statusCode < ORDER_STATUS.PENDING_PAYMENT
  ) {
    return res.status(403).json({
      status: 'error',
      message: 'Cannot proceed with payment due to the current order status',
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
    status_code: ORDER_STATUS.PENDING_CONFIRM_PAYMENT,
    payment_method,
  }

  if (proof_of_payment && payment_method !== 'cod') {
    updateData.proof_of_payment = proof_of_payment
  }

  const statusChange = {
    before: order.status_code,
    after: ORDER_STATUS.PENDING_CONFIRM_PAYMENT,
  }

  const result = await OrdersService.updateOrder(orderId, updateData)

  await OrdersService.createOrderStatusHistory(orderId, statusChange)

  const notificationData = {
    type: 'order_status',
    title: 'Order payment',
    message: `The payment has been sent for the order ${order.id}. Please confirm the payment.`,
    associated_collection: 'orders',
    associated_document: orderId,
  }

  await NotificationsService.createUserNotification(order.seller_id, notificationData)

  return res.json({ status: 'ok', data: result })
}

export default pay

import { Request, Response } from 'express'
import { ORDER_STATUS } from './index'
import { OrdersService } from '../../../service'

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
 *       required: true
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
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 */
const declineOrder = async (req: Request, res: Response) => {
  const data = req.body
  const { seller_id, reason = '' } = data
  const { orderId } = req.params
  const roles = res.locals.userRoles
  let requestorDocId = res.locals.userDoc.id || seller_id

  const order = await OrdersService.getOrderByID(orderId)

  if (!order)
    return res
      .status(403)
      .json({ status: 'error', message: `Order with id ${orderId} does not exist!` })

  const statusCode = parseInt(order.status_code)

  if (statusCode >= ORDER_STATUS.PENDING_CONFIRM_PAYMENT) {
    return res.status(403).json({
      status: 'error',
      message: 'Cannot decline anymore since the order payment was already confirmed',
    })
  }

  if (seller_id && roles.admin) {
    requestorDocId = seller_id
  }

  if (!roles.admin && order.seller_id !== requestorDocId)
    return res.status(403).json({
      status: 'error',
      message: `User with id ${requestorDocId} is not the seller from the order with id ${orderId}`,
    })

  const updateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    status_code: ORDER_STATUS.DECLINED,
    decline_reason: reason,
  }

  const statusChange = {
    before: order.status_code,
    after: ORDER_STATUS.DECLINED,
  }

  const result = await OrdersService.updateOrder(orderId, updateData)

  await OrdersService.createOrderStatusHistory(orderId, statusChange)

  return res.json({ status: 'ok', data: result })
}

export default declineOrder

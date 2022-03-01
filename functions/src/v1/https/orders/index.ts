/**
 * @openapi
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         products:
 *           type: array
 *           description: This is a subcollection that contains the snapshot of the products details during the time of order
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               quantity:
 *                 type: number
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: string
 *               image:
 *                 type: string
 *               instruction:
 *                 type: string
 *         product_ids:
 *           type: array
 *           description: contains the product ids
 *           items:
 *             type: string
 *         buyer_id:
 *           type: string
 *         shop_id:
 *           type: string
 *         seller_id:
 *           type: string
 *         delivery_option:
 *           type: string
 *         delivery_date:
 *           type: string
 *           format: date-time
 *           description: datetime of delivery
 *         created_at:
 *           type: string
 *           format: date-time
 *         is_paid:
 *           type: boolean
 *         payment_method:
 *           type: string
 *         proof_of_payment:
 *           type: string
 *           description: image url
 *         status_code:
 *           type: number
 *           description: id of the current order's status. See order_status collection
 *         status_history:
 *           type: array
 *           description: This is a subcollection that contains the changes happened to the order status
 *           items:
 *             type: object
 *             properties:
 *               before:
 *                 type: number
 *                 description: The status_code before the update
 *               after:
 *                 type: number
 *                 description: The status_code after the update
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *         shop:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             image:
 *               type: string
 *         instruction:
 *           type: string
 */

export const ORDER_STATUS = {
  CANCELLED: 10,
  DECLINED: 20,
  PENDING_CONFIRMATION: 100,
  PENDING_PAYMENT: 200,
  PENDING_CONFIRM_PAYMENT: 300,
  PENDING_SHIPMENT: 400,
  PENDING_RECEIPT: 500,
  FINISHED: 600,
}

export { default as createOrder } from './createOrder'
export { default as confirmOrder } from './confirmOrder'
export { default as pay } from './pay'
export { default as confirmPayment } from './confirmPayment'
export { default as shipOut } from './shipOut'
export { default as receive } from './receive'
export { default as decline } from './decline'
export { default as cancel } from './cancel'

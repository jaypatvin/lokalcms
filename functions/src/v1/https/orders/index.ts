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
 *               product_name:
 *                 type: string
 *               product_description:
 *                 type: string
 *               product_price:
 *                 type: string
 *               product_image:
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
 *               id:
 *                 type: string
 *               before:
 *                 type: number
 *               after:
 *                 type: number
 *               updated_at:
 *                 type: string
 *                 format: date-time
 *         shop_name:
 *           type: string
 *         shop_description:
 *           type: string
 *         shop_image:
 *           type: string
 *         instruction:
 *           type: string
 */

export const required_fields = ['products', 'buyer_id', 'shop_id', 'delivery_date']

export { default as createOrder } from './createOrder'

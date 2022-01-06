import { Request, Response } from 'express'
import { includes } from 'lodash'
import { OrderCreateData } from '../../../models/Order'
import {
  UsersService,
  ProductSubscriptionPlansService,
  ProductSubscriptionsService,
  OrdersService,
} from '../../../service'
import { ORDER_STATUS, payment_methods } from '../orders'

/**
 * @openapi
 * /v1/productSubscriptions/{id}/createOrder:
 *   post:
 *     tags:
 *       - product subscriptions
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create an actual order for the active product subscription
 *       # Examples
 *       ## creating an order from the product subscription on 2021-08-10 via bank. The id on the param should be the id of the product subscription.
 *       ```
 *       {
 *         "payment_method": "bank",
 *         "proof_of_payment": "https://image.shutterstock.com/image-vector/sample-stamp-grunge-texture-vector-260nw-1389188336.jpg"
 *       }
 *
 *       ```
 *       ## creating an order from the product subscription on 2021-08-10 with COD. The id on the param should be the id of the product subscription.
 *       ```
 *       {
 *         "payment_method": "cod"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: document id of the product subscription
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_method:
 *                 type: string
 *                 required: true
 *                 enum: [cod, bank, e-wallet]
 *               proof_of_payment:
 *                 type: string
 *               buyer_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: The new order from the product subscription
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
const createOrderFromSubscription = async (req: Request, res: Response) => {
  const data = req.body
  const { buyer_id, proof_of_payment, payment_method } = data
  const { id } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== buyer_id) {
    return res.status(400).json({
      status: 'error',
      message:
        'You do not have a permission to create an order of a product subscription of another user.',
    })
  }

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

  const subscriptionOrder = await ProductSubscriptionsService.getProductSubscriptionById(id)
  if (!subscriptionOrder) {
    return res
      .status(400)
      .json({ status: 'error', message: `Product subscription with id ${id} does not exist!` })
  }

  const {
    product_subscription_plan_id,
    instruction,
    quantity,
    date_string,
    date: orderDate,
  } = subscriptionOrder

  const plan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
    product_subscription_plan_id
  )

  if (!plan) {
    return res.status(400).json({
      status: 'error',
      message: `Product subscription plan with id ${product_subscription_plan_id} does not exist!`,
    })
  }

  if (plan.buyer_id !== buyer_id) {
    return res.status(400).json({
      status: 'error',
      message:
        'You do not have a permission to create an order of a product subscription of another user.',
    })
  }

  const existingOrder = await OrdersService.getOrdersByProductSubscriptionIdAndDate(
    subscriptionOrder.id,
    date_string
  )

  if (existingOrder.length) {
    return res.status(400).json({
      status: 'error',
      message: `An order already exist for the product subscription with id ${id}`,
    })
  }

  const { seller_id, community_id, product_id, product, shop_id, shop } = plan
  const buyer = await UsersService.getUserByID(buyer_id)
  const statusCode = ORDER_STATUS.PENDING_CONFIRM_PAYMENT
  const orderData: OrderCreateData = {
    buyer_id,
    seller_id,
    community_id,
    delivery_option: 'delivery',
    delivery_date: orderDate,
    instruction,
    is_paid: true,
    product_ids: [product_id],
    products: [
      {
        instruction: '',
        product_description: product.description,
        product_id,
        product_name: product.name,
        product_price: product.price,
        quantity,
        product_image: product.image || '',
      },
    ],
    shop_id,
    shop_name: shop.name,
    shop_description: shop.description,
    shop_image: shop.image || '',
    status_code: statusCode,
    delivery_address: buyer.address,
    product_subscription_id: subscriptionOrder.id,
    product_subscription_date: subscriptionOrder.date_string,
    payment_method,
  }

  const order = await OrdersService.createOrder(orderData)
  const result = await order.get().then((doc) => ({ id: order.id, ...doc.data() }))

  return res.json({ status: 'ok', data: result })
}

export default createOrderFromSubscription

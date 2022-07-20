import { RequestHandler } from 'express'
import { OrderCreateData } from '../../../models/Order'
import {
  UsersService,
  ProductSubscriptionPlansService,
  ProductSubscriptionsService,
  OrdersService,
} from '../../../service'
import { generateError, ErrorCode, generateNotFoundError } from '../../../utils/generators'
import { ORDER_STATUS } from '../orders'

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
const createOrderFromSubscription: RequestHandler = async (req, res) => {
  const data = req.body
  const { buyer_id, payment_method } = data
  const { id } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== buyer_id) {
    throw generateError(ErrorCode.ProductSubscriptionApiError, {
      message:
        'User does not have a permission to create an order of a product subscription of another user',
    })
  }

  const subscription = await ProductSubscriptionsService.findById(id)
  if (!subscription) {
    throw generateNotFoundError(ErrorCode.ProductSubscriptionApiError, 'Product Subscription', id)
  }

  const {
    product_subscription_plan_id,
    instruction,
    quantity,
    date_string,
    date: orderDate,
  } = subscription

  const plan = await ProductSubscriptionPlansService.findById(product_subscription_plan_id)

  if (!plan) {
    throw generateNotFoundError(
      ErrorCode.ProductSubscriptionApiError,
      'Product Subscription Plan',
      product_subscription_plan_id
    )
  }

  if (plan.buyer_id !== buyer_id) {
    throw generateError(ErrorCode.ProductSubscriptionApiError, {
      message:
        'User does not have a permission to create an order of a product subscription of another user',
    })
  }

  const existingOrder = await OrdersService.findOrdersByProductSubscriptionIdAndDate(
    subscription.id,
    date_string
  )

  if (existingOrder.length) {
    throw generateError(ErrorCode.ProductSubscriptionApiError, {
      message: `An order already exist for the product subscription with id ${id}`,
    })
  }

  const { seller_id, community_id, product_id, product, shop_id, shop } = plan
  const buyer = await UsersService.findById(buyer_id)
  if (!buyer) {
    throw generateNotFoundError(ErrorCode.ProductSubscriptionApiError, 'User', buyer_id)
  }
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
        description: product.description,
        id: product_id,
        name: product.name,
        price: product.price,
        quantity,
        image: product.image || '',
      },
    ],
    shop_id,
    shop: {
      name: shop.name,
      description: shop.description,
      image: shop.image || '',
    },
    status_code: statusCode,
    delivery_address: buyer.address,
    product_subscription_id: subscription.id,
    product_subscription_date: subscription.date_string,
    payment_method,
    total_price: product.price * quantity
  }

  const result = await OrdersService.create(orderData)

  return res.json({ status: 'ok', data: result })
}

export default createOrderFromSubscription

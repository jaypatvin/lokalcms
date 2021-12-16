import { Request, Response } from 'express'
import { includes, isDate } from 'lodash'
import {
  NotificationsService,
  OrdersService,
  ProductsService,
  ShopsService,
  UsersService,
} from '../../../service'
import { validateFields } from '../../../utils/validations'
import { required_fields } from './index'

/**
 * @openapi
 * /v1/orders:
 *   post:
 *     tags:
 *       - orders
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new order. The instruction fields are optional.
 *       ## Note: The buyer_id will be the document id of the requestor which is extracted from the firestore token that should be in the request header.
 *       ## buyer_id on the request body will only be used by admins, which the admin can put any existing user ids
 *       # Examples
 *       ## User _user-id-1_ buying 3 products from shop _shop-id-1_ with instruction, and is a pickup
 *       ```
 *       {
 *         "products": [
 *           {
 *             "id": "product-id-1",
 *             "quantity": 1
 *           },
 *           {
 *             "id": "product-id-2",
 *             "quantity": 3,
 *             "instruction": "pakibalot maigi"
 *           },
 *           {
 *             "id": "product-id-3",
 *             "quantity": 10
 *           }
 *         ],
 *         "buyer_id": "user-id-1",
 *         "shop_id": "shop-id-1",
 *         "delivery_option": "pickup",
 *         "delivery_date": "2021-06-26T11:35:22.776Z",
 *         "instruction": "pakiingatan ha"
 *       }
 *       ```
 *
 *       ## User _user-id-1_ buying 1 product from shop _shop-id-1_ without any instruction, and to be delivered
 *       ```
 *       {
 *         "products": [
 *           {
 *             "id": "product-id-1",
 *             "quantity": 10
 *           }
 *         ],
 *         "buyer_id": "user-id-1",
 *         "shop_id": "shop-id-1",
 *         "delivery_option": "delivery",
 *         "delivery_date": "2021-06-26T11:35:22.776Z"
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 required: true
 *                 description: Array of products containing the id, quantity, and instruction
 *                 items:
 *                   type: object
 *                   required: true
 *                   properties:
 *                     id:
 *                       type: string
 *                       required: true
 *                       description: document id of the product
 *                     quantity:
 *                       type: number
 *                       required: true
 *                       description: how many of this product is in the order
 *                     instruction:
 *                       type: string
 *                       description: instruction or additional notes added by the buyer specifically for this product
 *               buyer_id:
 *                 type: string
 *                 description: document id of the user who is placing an order
 *               shop_id:
 *                 type: string
 *                 required: true
 *                 description: document id of the shop
 *               delivery_option:
 *                 type: string
 *                 required: true
 *                 description: either pickup or delivery
 *                 enum: [pickup, delivery]
 *               delivery_date:
 *                 type: string
 *                 required: true
 *                 format: date-time
 *                 description: datetime of delivery
 *               instruction:
 *                 type: string
 *                 description: instruction or additional notes for the whole order
 *     responses:
 *       200:
 *         description: The new order
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
const createOrder = async (req: Request, res: Response) => {
  const data = req.body
  const roles = res.locals.userRoles
  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }
  const { products, buyer_id, shop_id, delivery_option, delivery_date, instruction = '' } = data
  let requestorDocId = res.locals.userDoc.id
  let buyer = res.locals.userDoc
  if (roles.admin && buyer_id) {
    buyer = await UsersService.getUserByID(buyer_id)
    if (!buyer) {
      return res
        .status(400)
        .json({ status: 'error', message: `User with id ${buyer_id} does not exist.` })
    }
    requestorDocId = buyer_id
  }

  if (!isDate(new Date(delivery_date))) {
    return res.status(400).json({ status: 'error', message: 'delivery_date is not a valid date.' })
  }

  if (!includes(['pickup', 'delivery'], delivery_option)) {
    return res
      .status(400)
      .json({ status: 'error', message: 'delivery_option can only be "pickup" or "delivery"' })
  }

  const shop = await ShopsService.getShopByID(shop_id)

  if (!shop) {
    return res
      .status(400)
      .json({ status: 'error', message: `Shop with id ${shop_id} does not exist.` })
  }

  const orderProducts = []
  for (const rawOrderProduct of products) {
    const { id, quantity, instruction = '' } = rawOrderProduct
    const product = await ProductsService.getProductByID(id)
    if (!product) {
      return res
        .status(400)
        .json({ status: 'error', message: `Product with id ${id} does not exist.` })
    }
    if (product.shop_id !== shop_id) {
      return res
        .status(400)
        .json({ status: 'error', message: `Product ${product.name} is not on shop ${shop.name}` })
    }
    if (!isFinite(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ status: 'error', message: `Quantity of ${product.name} is not valid` })
    }
    if (product.quantity - quantity < 0) {
      return res
        .status(400)
        .json({
          status: 'error',
          message: `Product "${product.name}" only has ${product.quantity} left.`,
        })
    }
    const orderProduct: any = {
      product_id: id,
      quantity,
      product_name: product.name,
      product_description: product.description,
      product_price: product.base_price,
      product_category: product.product_category,
      instruction,
    }
    if (product.gallery && product.gallery.length) {
      orderProduct.product_image = product.gallery[0].url
    }
    orderProducts.push(orderProduct)
  }
  for (const product of products) {
    await ProductsService.decrementProductQuantity(product.id, product.quantity)
  }
  const productIds = products.map((p) => p.id)

  const newOrder: any = {
    products: orderProducts,
    product_ids: productIds,
    buyer_id: requestorDocId,
    shop_id,
    seller_id: shop.user_id,
    community_id: shop.community_id,
    delivery_date: new Date(delivery_date),
    delivery_option,
    instruction,
    is_paid: false,
    status_code: 100,
    shop_name: shop.name,
    shop_description: shop.description,
  }

  if (shop.profile_photo) {
    newOrder.shop_image = shop.profile_photo
  }
  if (buyer.address) {
    newOrder.delivery_address = buyer.address
  }

  const order = await OrdersService.createOrder(newOrder)
  const result = await order.get().then((doc): any => ({ id: order.id, ...doc.data() }))

  // 100 - Waiting for Confirmation - this is the first status of the order
  const initialStatusHistory = {
    before: 0,
    after: 100,
  }

  const statusHistory = await OrdersService.createOrderStatusHistory(order.id, initialStatusHistory)

  const notificationData = {
    type: 'order_status',
    title: 'New order has been made for confirmation',
    message: `New order (${result.products.length} products) is ready for your confirmation.`,
    associated_collection: 'orders',
    associated_document: result.id,
  }

  await NotificationsService.createUserNotification(shop.user_id, notificationData)

  return res.status(200).json({ status: 'ok', data: { ...result, status_history: statusHistory } })
}

export default createOrder

import { RequestHandler } from 'express'
import Order, { OrderCreateData } from '../../../models/Order'
import {
  NotificationsService,
  OrdersService,
  ProductsService,
  ShopsService,
  UsersService,
} from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

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
const createOrder: RequestHandler = async (req, res) => {
  const data = req.body
  const roles = res.locals.userRoles
  const { products, buyer_id, shop_id, delivery_option, delivery_date, instruction = '' } = data
  let requestorDocId = res.locals.userDoc.id
  let buyer = res.locals.userDoc

  if (roles.admin && buyer_id) {
    buyer = await UsersService.findById(buyer_id)
    if (!buyer) {
      throw generateNotFoundError(ErrorCode.OrderApiError, 'User', buyer_id)
    }
    requestorDocId = buyer_id
  }

  const shop = await ShopsService.findById(shop_id)
  if (!shop) {
    throw generateNotFoundError(ErrorCode.OrderApiError, 'Shop', shop_id)
  }

  const orderProducts: Order['products'] = []
  for (const rawOrderProduct of products) {
    const { id, quantity, instruction = '' } = rawOrderProduct
    const product = await ProductsService.findById(id)
    if (!product) {
      throw generateNotFoundError(ErrorCode.OrderApiError, 'Product', id)
    }
    if (product.shop_id !== shop_id) {
      throw generateError(ErrorCode.OrderApiError, {
        message: `Product ${product.name} is not on shop ${shop.name}`,
      })
    }
    if (product.quantity - quantity < 0) {
      throw generateError(ErrorCode.OrderApiError, {
        message: `Product "${product.name}" only has ${product.quantity} left.`,
      })
    }
    const orderProduct: Order['products'][0] = {
      id,
      quantity,
      name: product.name,
      description: product.description,
      price: product.base_price,
      category: product.product_category,
      instruction,
    }
    if (product.gallery && product.gallery.length) {
      orderProduct.image = product.gallery[0].url
    }
    orderProducts.push(orderProduct)
  }
  for (const product of products) {
    await ProductsService.decrementProductQuantity(product.id, product.quantity)
  }
  const productIds = products.map((p) => p.id)

  const newOrder: OrderCreateData = {
    products: orderProducts,
    product_ids: productIds,
    buyer_id: requestorDocId,
    shop_id,
    seller_id: shop.user_id,
    community_id: shop.community_id,
    // @ts-ignore
    delivery_date: new Date(delivery_date),
    delivery_option,
    instruction,
    is_paid: false,
    status_code: 100,
    shop: {
      name: shop.name,
      description: shop.description,
    },
  }

  if (shop.profile_photo) {
    newOrder.shop.image = shop.profile_photo
  }
  if (buyer.address) {
    newOrder.delivery_address = buyer.address
  }

  const result = await OrdersService.create(newOrder)

  const notificationData = {
    type: 'order_status',
    title: 'New order has been made for confirmation',
    // @ts-ignore: ts bug?
    message: `New order (${result.products.length} products) is ready for your confirmation.`,
    associated_collection: 'orders',
    associated_document: result.id,
  }

  await NotificationsService.create(shop.user_id, notificationData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default createOrder

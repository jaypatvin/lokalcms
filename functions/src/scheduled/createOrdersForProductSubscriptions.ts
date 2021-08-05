import dayjs from 'dayjs'
import {
  OrdersService,
  ProductSubscriptionPlansService,
  ProductSubscriptionsService,
  UsersService,
} from '../service'
import { ORDER_STATUS } from '../v1/https/orders'

const daysBeforeOrder = 3

const createOrdersForProductSubscriptions = async () => {
  const orderDate = dayjs(new Date()).add(daysBeforeOrder, 'days').format('YYYY-MM-DD')
  const subscriptionOrders = await ProductSubscriptionsService.getProductSubscriptionsByDate(
    orderDate
  )
  if (!subscriptionOrders.length) {
    console.log(`There are no upcoming subscription orders ${daysBeforeOrder} day/s from now.`)
  }

  const createdOrders = []

  for (let subscriptionOrder of subscriptionOrders) {
    const { product_subscription_plan_id, instruction, quantity, date_string } = subscriptionOrder
    const plan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
      product_subscription_plan_id
    )
    const existingOrder = await OrdersService.getOrdersByProductSubscriptionIdAndDate(
      subscriptionOrder.id,
      date_string
    )
    console.log('existingOrder', existingOrder)
    if (plan && !existingOrder.length) {
      const {
        buyer_id,
        seller_id,
        community_id,
        product_id,
        product,
        shop_id,
        shop,
        payment_method,
      } = plan
      const buyer = await UsersService.getUserByID(buyer_id)
      const isCod = payment_method === 'cod'
      const statusCode = isCod ? ORDER_STATUS.PENDING_SHIPMENT: ORDER_STATUS.PENDING_PAYMENT
      const orderData = {
        buyer_id,
        seller_id,
        community_id,
        delivery_option: 'delivery',
        delivery_date: new Date(orderDate),
        instruction,
        is_paid: isCod,
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
      createdOrders.push(result)
    }
  }

  console.log(`Created a total orders of ${createdOrders.length}`)
  console.log(createdOrders.map((o) => o.id))

  return createdOrders
}

export default createOrdersForProductSubscriptions

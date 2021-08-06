import dayjs from 'dayjs'
import * as functions from 'firebase-functions'
import sgMail from '@sendgrid/mail'
import {
  OrdersService,
  ProductSubscriptionPlansService,
  ProductSubscriptionsService,
  UsersService,
} from '../service'
import { ORDER_STATUS } from '../v1/https/orders'

sgMail.setApiKey(functions.config().mail_service.key)

const notifyDays = 3

const notifyUsersOnproductSubscriptions = async () => {
  const orderDate = dayjs(new Date()).add(notifyDays, 'days').format('YYYY-MM-DD')
  const upcomingSubscriptions = await ProductSubscriptionsService.getProductSubscriptionsByDate(
    orderDate
  )
  if (!upcomingSubscriptions.length) {
    console.log('There are no upcoming subscription orders 3 days from now.')
  }

  const sellersSubscriptionsMap = {}
  const buyersSubscriptionsMap = {}
  const createdOrders = []

  for (let subscription of upcomingSubscriptions) {
    const { product_subscription_plan_id, instruction, quantity, date_string } = subscription
    const planInfo = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
      product_subscription_plan_id
    )
    const seller_id = planInfo.seller_id
    if (!sellersSubscriptionsMap[seller_id]) sellersSubscriptionsMap[seller_id] = []
    subscription.plan = planInfo
    sellersSubscriptionsMap[seller_id].push(subscription)

    const buyer_id = planInfo.buyer_id
    if (!buyersSubscriptionsMap[buyer_id]) buyersSubscriptionsMap[buyer_id] = []
    subscription.plan = planInfo
    buyersSubscriptionsMap[buyer_id].push(subscription)

    const existingOrder = await OrdersService.getOrdersByProductSubscriptionIdAndDate(
      subscription.id,
      date_string
    )

    // create order for the subscription
    if (planInfo && !existingOrder.length) {
      const {
        buyer_id,
        seller_id,
        community_id,
        product_id,
        product,
        shop_id,
        shop,
        payment_method,
      } = planInfo
      const buyer = await UsersService.getUserByID(buyer_id)
      const isCod = payment_method === 'cod'
      const statusCode = isCod ? ORDER_STATUS.PENDING_SHIPMENT : ORDER_STATUS.PENDING_PAYMENT
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
        product_subscription_id: subscription.id,
        product_subscription_date: date_string,
        payment_method,
      }

      const order = await OrdersService.createOrder(orderData)
      const result = await order.get().then((doc) => ({ id: order.id, ...doc.data() }))
      createdOrders.push(result)
    }
  }

  console.log(`Created a total orders of ${createdOrders.length}`)
  console.log(createdOrders.map((o) => o.id))

  // emailing the sellers
  for (let [seller_id, subscriptions] of Object.entries<any>(sellersSubscriptionsMap)) {
    const user = await UsersService.getUserByID(seller_id)
    if (user) {
      let html = `<h1>You have ${subscriptions.length} subscription orders on ${orderDate}</h1>`
      for (let subscription of subscriptions) {
        const content = `<p><strong>${subscription.quantity}</strong> - ${subscription.plan.product.name}</p>`
        html += content
      }
      html +=
        '<br><p>You may manage any of your subscription orders on your subscription calendar.</p>'
      const msg = {
        to: user.email,
        from: functions.config().invite_mail_config.from,
        'reply-to': functions.config().invite_mail_config.reply_to,
        subject: `You have ${subscriptions.length} subscription orders on ${orderDate}`,
        html,
      }

      await sgMail.send(msg)
    }
  }

  // emailing the buyers
  for (let [buyer_id, subscriptions] of Object.entries<any>(buyersSubscriptionsMap)) {
    const user = await UsersService.getUserByID(buyer_id)
    if (user) {
      let html = `<h1>You have ${subscriptions.length} subscription orders on ${orderDate}</h1>`
      for (let subscription of subscriptions) {
        const content = `<p><strong>${subscription.quantity}</strong> - ${subscription.plan.product.name}</p>`
        html += content
      }
      html += `<br><p>Please make sure to make payments before ${orderDate}</p>`
      const msg = {
        to: user.email,
        from: functions.config().invite_mail_config.from,
        'reply-to': functions.config().invite_mail_config.reply_to,
        subject: `You have ${subscriptions.length} subscription orders on ${orderDate}`,
        html,
      }

      await sgMail.send(msg)
    }
  }

  return { sellers: sellersSubscriptionsMap, buyers: buyersSubscriptionsMap, createdOrders }
}

export default notifyUsersOnproductSubscriptions

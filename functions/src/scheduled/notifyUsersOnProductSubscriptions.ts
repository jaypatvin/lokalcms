import dayjs from 'dayjs'
import * as functions from 'firebase-functions'
import sgMail from '@sendgrid/mail'
import {
  ProductSubscriptionPlansService,
  ProductSubscriptionsService,
  UsersService,
} from '../service'

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

  for (let subscription of upcomingSubscriptions) {
    const planInfo = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
      subscription.product_subscription_plan_id
    )
    const seller_id = planInfo.seller_id
    if (!sellersSubscriptionsMap[seller_id]) sellersSubscriptionsMap[seller_id] = []
    subscription.plan = planInfo
    sellersSubscriptionsMap[seller_id].push(subscription)

    const buyer_id = planInfo.buyer_id
    if (!buyersSubscriptionsMap[buyer_id]) buyersSubscriptionsMap[buyer_id] = []
    subscription.plan = planInfo
    buyersSubscriptionsMap[buyer_id].push(subscription)
  }

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

  return { sellers: sellersSubscriptionsMap, buyers: buyersSubscriptionsMap }
}

export default notifyUsersOnproductSubscriptions

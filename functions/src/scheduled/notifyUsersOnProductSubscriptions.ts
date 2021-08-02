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

  const usersSubscriptionsMap = {}

  for (let subscription of upcomingSubscriptions) {
    const planInfo = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(
      subscription.product_subscription_plan_id
    )
    const seller_id = planInfo.seller_id
    if (!usersSubscriptionsMap[seller_id]) usersSubscriptionsMap[seller_id] = []
    subscription.plan = planInfo
    usersSubscriptionsMap[seller_id].push(subscription)
  }

  for (let [seller_id, subscriptions] of Object.entries<any>(usersSubscriptionsMap)) {
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

      console.log('msg', msg)

      await sgMail.send(msg)
    }
  }

  return usersSubscriptionsMap
}

export default notifyUsersOnproductSubscriptions

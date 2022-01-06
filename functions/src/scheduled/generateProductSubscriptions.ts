import dayjs from 'dayjs'
import { ProductSubscriptionPlansService, ProductSubscriptionsService } from '../service'
import { isDateValidInSchedule } from '../utils/validations'

const generateProductSubscriptions = async (planId?: string) => {
  const today = new Date()
  const maxRangeDays = 14
  let subscriptions = []
  if (planId) {
    const subscriptionPlan = await ProductSubscriptionPlansService.getProductSubscriptionPlanById(planId)
    if (subscriptionPlan.archived || subscriptionPlan.status !== 'enabled') {
      return null
    }
    subscriptions = [subscriptionPlan]
  } else {
    subscriptions = await ProductSubscriptionPlansService.getAllSubscriptionPlans()
  }
  const totalSubscriptionsMade = []
  for (let subscription of subscriptions) {
    const {
      repeat_unit,
      repeat_type,
      start_dates,
      schedule,
      override_dates = {},
    } = subscription.plan
    const firstStartDate = start_dates[0]
    const nextSubscriptionDates = []
    let overrideDatesToOriginalMap = {}
    let i = 0
    while (i <= maxRangeDays) {
      const dateToCheck = dayjs(today).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const isDateValid = isDateValidInSchedule({
        repeat_type,
        repeat_unit,
        schedule,
        startDate: firstStartDate,
        dateToCheck,
      })
      if (isDateValid) {
        const overrideDate = override_dates[dateToCheckFormat]
        if (overrideDate) overrideDatesToOriginalMap[overrideDate] = new Date(dateToCheckFormat)
        nextSubscriptionDates.push(overrideDate ?? dateToCheckFormat)
      }
      i++
    }
    if (nextSubscriptionDates.length) {
      for (let subscriptionDate of nextSubscriptionDates) {
        const existingActiveSubscription =
          await ProductSubscriptionsService.getProductSubscriptionByDateAndPlanId(
            subscription.id,
            subscriptionDate
          )
        if (!existingActiveSubscription.length) {
          const originalDate =
            overrideDatesToOriginalMap[subscriptionDate] ?? new Date(subscriptionDate)
          const data = {
            buyer_id: subscription.buyer_id,
            seller_id: subscription.seller_id,
            product_subscription_plan_id: subscription.id,
            quantity: subscription.quantity,
            confirmed_by_buyer: false,
            confirmed_by_seller: false,
            skip: false,
            instruction: subscription.instruction || '',
            date: originalDate,
            date_string: subscriptionDate,
            original_date: originalDate,
          }
          const newSubscription = await ProductSubscriptionsService.createProductSubscription(data)
          totalSubscriptionsMade.push(newSubscription.id)
        }
      }
    }
  }
  console.log(`Made total subscriptions of ${totalSubscriptionsMade}`)
  return totalSubscriptionsMade
}

export default generateProductSubscriptions

import dayjs from 'dayjs'
import _ from 'lodash'
import { ProductSubscriptionPlansService, ProductSubscriptionsService } from '../service'
import { DayKeyVal } from '../utils/helpers'

const generateProductSubscriptions = async () => {
  const today = new Date()
  const maxRangeDays = 14
  const subscriptions = await ProductSubscriptionPlansService.getAllSubscriptionPlans()
  const totalSubscriptionsMade = []
  for (let subscription of subscriptions) {
    const { repeat_unit, repeat_type, start_dates, schedule } = subscription.plan
    const firstStartDate = start_dates[0]
    const nextSubscriptionDates = []
    let i = 1
    while (i <= maxRangeDays) {
      const dateToCheck = dayjs(today).add(i, 'days')
      const dateToCheckFormat = dateToCheck.format('YYYY-MM-DD')
      const dateToCheckDay = DayKeyVal[dateToCheck.day()]
      const dateNumToCheck = dayjs(dateToCheck).date()
      const nthWeekToCheck = Math.ceil(dateNumToCheck / 7)
      const nthDayOfMonthToCheck = `${nthWeekToCheck}-${dateToCheckDay}`
      const weekAvailabilityStartDate = _.get(schedule, `${dateToCheckDay}.start_date`)
      if (
        (repeat_unit === 1 && repeat_type === 'day') ||
        (repeat_unit === 1 &&
          repeat_type === 'week' &&
          weekAvailabilityStartDate &&
          (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
            dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
        (repeat_unit === 1 &&
          repeat_type === 'month' &&
          dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit === 1 &&
          repeat_type === nthDayOfMonthToCheck &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit > 1 &&
          repeat_type === 'day' &&
          dayjs(dateToCheck).diff(firstStartDate, 'days') % repeat_unit === 0 &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit > 1 &&
          repeat_type === 'week' &&
          dayjs(dateToCheck).diff(weekAvailabilityStartDate, 'weeks') % repeat_unit === 0 &&
          (dayjs(weekAvailabilityStartDate).isBefore(dateToCheck) ||
            dayjs(weekAvailabilityStartDate).isSame(dateToCheck))) ||
        (repeat_unit > 1 &&
          repeat_type === 'month' &&
          dayjs(firstStartDate).date() === dayjs(dateToCheck).date() &&
          dayjs(dateToCheck).diff(firstStartDate, 'months') % repeat_unit === 0 &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck))) ||
        (repeat_unit > 1 &&
          repeat_type === nthDayOfMonthToCheck &&
          dayjs(dateToCheck).diff(firstStartDate, 'months') % repeat_unit === 0 &&
          (dayjs(firstStartDate).isBefore(dateToCheck) ||
            dayjs(firstStartDate).isSame(dateToCheck)))
      ) {
        nextSubscriptionDates.push(dateToCheckFormat)
      }
      i++
    }
    if (nextSubscriptionDates.length) {
      for (let subscriptionDate of nextSubscriptionDates) {
        const existingActiveSubscription = await ProductSubscriptionsService.getProductSubscriptionByDateAndPlanId(subscription.id, subscriptionDate)
        if (!existingActiveSubscription.length) {
          const originalDate = new Date(subscriptionDate)
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

import dayjs from 'dayjs'
import { useState } from 'react'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import { OutlineButton } from '../../components/buttons'
import { buttonIcons } from '../../components/buttons/theme'
import { formatToPeso } from '../../utils/helper'
import { DayKeyVal } from '../../utils/types'

type Props = {
  subscriptionPlan: any
  onViewSubscriptions: () => void
}

const nthDayOfMonthFormat = /^(1|2|3|4|5)-(mon|tue|wed|thu|fri|sat|sun)$/

const ProductSubscriptionPlanDetails = ({ subscriptionPlan, onViewSubscriptions }: Props) => {
  const [showMore, setShowMore] = useState(false)

  let plan = '-'
  if (subscriptionPlan.plan) {
    const {
      start_dates,
      repeat_unit,
      repeat_type,
      schedule: { mon, tue, wed, thu, fri, sat, sun },
    } = subscriptionPlan.plan
    if (repeat_unit === 0) {
      plan = start_dates[0]
    } else if (repeat_unit > 0) {
      const daysAvailable = []
      if (mon) daysAvailable.push('monday')
      if (tue) daysAvailable.push('tuesday')
      if (wed) daysAvailable.push('wednesday')
      if (thu) daysAvailable.push('thursday')
      if (fri) daysAvailable.push('friday')
      if (sat) daysAvailable.push('saturday')
      if (sun) daysAvailable.push('sunday')
      if (repeat_unit === 1) {
        if (repeat_type === 'day') plan = 'Every day'
        if (repeat_type === 'week') plan = `Every week on ${daysAvailable}`
        if (repeat_type === 'month')
          plan = `Every ${dayjs(start_dates[0]).format('Do')} of the month`
        if (nthDayOfMonthFormat.test(repeat_type)) {
          const [nth] = repeat_type.split('-')
          plan = `Every ${dayjs(`2021-01-${nth}`).format('Do')} ${dayjs(start_dates[0]).format(
            'dddd'
          )}`
        }
      } else if (repeat_unit > 1) {
        if (repeat_type === 'day') plan = `Every ${repeat_unit} days`
        if (repeat_type === 'week') plan = `Every ${repeat_unit} weeks on ${daysAvailable}`
        if (repeat_type === 'month')
          plan = `Every ${dayjs(start_dates[0]).format('Do')} of every ${repeat_unit} months`
        if (nthDayOfMonthFormat.test(repeat_type)) {
          const [nth] = repeat_type.split('-')
          plan = `Every ${dayjs(`2021-01-${nth}`).format('Do')} ${dayjs(start_dates[0]).format(
            'dddd'
          )} of every ${repeat_unit} months`
        }
      }
    }
  }

  const getTileClass = ({ date }: CalendarTileProperties) => {
    const { start_dates, repeat_unit, repeat_type, schedule } = subscriptionPlan.plan
    const firstDate = start_dates[0]
    const firstDateDay = DayKeyVal[dayjs(firstDate).day()]
    const firstDateNumToCheck = dayjs(firstDate).date()
    const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
    const firstDateNthDayOfMonth = `${firstDateNthWeek}-${firstDateDay}`
    const tileDate = dayjs(date)
    const tileDateDay = DayKeyVal[tileDate.day()]
    const tileDateNumToCheck = tileDate.date()
    const tileDateNthWeek = Math.ceil(tileDateNumToCheck / 7)
    const tileDateNthDayOfMonth = `${tileDateNthWeek}-${tileDateDay}`
    const day = DayKeyVal[tileDate.day()]
    const schedDay = schedule[day]
    let tileClass = null

    if (repeat_type === 'day') {
      const isValid = dayjs(date).diff(firstDate, 'days') % repeat_unit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        tileClass = 'orange'
      }
    }
    if (repeat_type === 'week' && schedDay) {
      const isValid = dayjs(date).diff(schedDay.start_date, 'weeks') % repeat_unit === 0
      if (
        isValid &&
        (dayjs(schedDay.start_date).isBefore(date) || dayjs(schedDay.start_date).isSame(date))
      ) {
        tileClass = 'orange'
      }
    }
    if (repeat_type === 'month') {
      const isValid =
        dayjs(firstDate).date() === dayjs(date).date() &&
        dayjs(date).diff(firstDate, 'months') % repeat_unit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        tileClass = 'orange'
      }
    }
    if (nthDayOfMonthFormat.test(repeat_type)) {
      const isValid =
        firstDateNthDayOfMonth === tileDateNthDayOfMonth &&
        dayjs(date).diff(firstDate, 'months') % repeat_unit === 0
      if (isValid && (dayjs(firstDate).isBefore(date) || dayjs(firstDate).isSame(date))) {
        tileClass = 'orange'
      }
    }
    return tileClass
  }

  return (
    <>
      <div className="flex p-3 pb-5 mb-1 border-1 justify-between shadow-md w-full relative hover:bg-primary-50">
        <button
          className="absolute bottom-0 left-0 text-2xl w-full flex justify-center"
          onClick={() => setShowMore(!showMore)}
        >
          {buttonIcons[showMore ? 'caretUpLg' : 'caretDownLg']}
        </button>
        <div className="w-1/4">
          <p>
            <strong>Shop: {subscriptionPlan.shop.name}</strong>
          </p>
          <p>Buyer: {subscriptionPlan.buyer_email}</p>
          <p>Seller: {subscriptionPlan.seller_email}</p>
          {showMore && (
            <>
              <p>ID: {subscriptionPlan.id}</p>
              <p>
                Created: {dayjs(subscriptionPlan.created_at.toDate()).format('YYYY-MM-DD h:mm a')}
              </p>
              <p className="italic">{subscriptionPlan.shop.description}</p>
              {subscriptionPlan.shop.image ? (
                <img
                  src={subscriptionPlan.shop.image}
                  alt={subscriptionPlan.shop.name}
                  className="max-w-full max-h-40 m-2"
                />
              ) : (
                ''
              )}
            </>
          )}
        </div>
        <div className="w-1/4">
          {showMore && (
            <div className="border-b-1 mb-2 py-2 flex items-center">
              <div className="w-24 mr-2">
                {subscriptionPlan.product.image ? (
                  <img
                    src={subscriptionPlan.product.image}
                    alt={subscriptionPlan.product.name}
                    className="max-w-24 max-h-24"
                  />
                ) : (
                  ''
                )}
              </div>
              <p>
                {`${subscriptionPlan.product.name} (${subscriptionPlan.quantity}) = ${formatToPeso(
                  subscriptionPlan.product.price * subscriptionPlan.quantity
                )}`}{' '}
              </p>
            </div>
          )}
          {!showMore && (
            <p className="font-bold">
              {subscriptionPlan.quantity} x {subscriptionPlan.product.name}
            </p>
          )}
          <p>
            Total Price: {formatToPeso(subscriptionPlan.product.price * subscriptionPlan.quantity)}
          </p>
        </div>
        <div className="w-1/4">
          <p className="whitespace-no-wrap flex">
            <OutlineButton
              className="text-primary-500 mr-1 h-8"
              size="small"
              icon="calendar"
              onClick={() => setShowMore(!showMore)}
            />
            {plan}
          </p>
          <OutlineButton
            className="text-primary-500 mr-1 h-8"
            size="small"
            onClick={onViewSubscriptions}
          >
            View Subscriptions
          </OutlineButton>
          {showMore && (
            <div className="w-64">
              <ReactCalendar
                className="text-xs"
                tileClassName={getTileClass}
                onChange={() => null}
                calendarType="US"
              />
            </div>
          )}
        </div>
        <div className="w-1/4">
          <p>
            Status:{' '}
            <span
              className={
                subscriptionPlan.status === 'enabled' ? 'text-primary-500' : 'text-danger-500'
              }
            >
              {subscriptionPlan.status || '--'}
            </span>
          </p>
          <p>Payment method: {subscriptionPlan.payment_method || '--'}</p>
          {subscriptionPlan.instruction && showMore ? (
            <p className="italic">Instruction: {subscriptionPlan.instruction}</p>
          ) : (
            ''
          )}
        </div>
      </div>
    </>
  )
}

export default ProductSubscriptionPlanDetails

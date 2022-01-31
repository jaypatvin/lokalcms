import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import ReactCalendar, { CalendarTileProperties } from 'react-calendar'
import Dropdown from '../../components/Dropdown'
import { Checkbox, TextField } from '../../components/inputs'
import Modal from '../../components/modals'
import { useAuth } from '../../contexts/AuthContext'
import useOuterClick from '../../customHooks/useOuterClick'
import { formatToPeso } from '../../utils/helper'
import { DayKeyVal, DaysType, RepeatType } from '../../utils/types'
import { API_URL } from '../../config/variables'
import { Product, Shop, User } from '../../models'

const days: DaysType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const defaultStartDate = new Date()
defaultStartDate.setHours(0, 0, 0, 0)

type ShopData = Shop & { id: string }
type ProductData = Product & { id: string }
type UserData = User & { id: string }
type SubscriptionData = {
  shop: {
    id: string
    name: string
    image?: string
  }
  product: {
    id: string
    name: string
    price: number
    image?: string
    quantity: number
  }
  quantity: number
  instruction: string
  plan: {
    days: DaysType[]
    start_dates: Date[]
    repeat_unit: number
    repeat_type: RepeatType
    repeat_month_type: 'sameDay' | 'sameDate'
  }
}

type Props = {
  shop: ShopData
  product: ProductData
  isOpen: boolean
  setIsOpen: (val: boolean) => void
  user?: UserData
}

const CreateSubscriptionPlanModal = ({ shop, product, isOpen, setIsOpen, user }: Props) => {
  const { firebaseToken } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>()
  const [showStartCalendar, setShowStartCalendar] = useState(false)
  const startCalendarRef = useOuterClick(() => setShowStartCalendar(false))

  useEffect(() => {
    const subscriptionProduct = {
      id: product.id,
      name: product.name,
      price: product.base_price,
      image: product.gallery?.[0].url,
      quantity: 0,
    }
    const subscriptionShop = {
      id: shop.id,
      name: shop.name,
      image: shop.profile_photo,
    }
    setSubscriptionData({
      shop: subscriptionShop,
      product: subscriptionProduct,
      quantity: 1,
      instruction: '',
      plan: {
        days: [],
        start_dates: [defaultStartDate],
        repeat_unit: 1,
        repeat_type: 'day',
        repeat_month_type: 'sameDate',
      },
    })
  }, [])

  const tileDisabled = ({ date }: CalendarTileProperties) => {
    if (subscriptionData && subscriptionData.plan.repeat_type === 'week') {
      return !subscriptionData.plan.days.includes(DayKeyVal[date.getDay()])
    }
    return false
  }

  const onClickStartDate = (date: Date) => {
    if (!subscriptionData) return
    if (subscriptionData.plan.repeat_type === 'day') {
      setSubscriptionData({
        ...subscriptionData,
        plan: {
          ...subscriptionData.plan,
          start_dates: [date],
        },
      })
    } else {
      const dates = [date]
      for (let i = 1; i <= 6; i++) {
        const checkDate = dayjs(date).add(i, 'days')
        const checkDay = DayKeyVal[checkDate.day()]
        if (subscriptionData.plan.days.includes(checkDay)) {
          dates.push(new Date(checkDate.format('YYYY-MM-DD')))
        }
      }
      setSubscriptionData({
        ...subscriptionData,
        plan: {
          ...subscriptionData.plan,
          start_dates: dates,
        },
      })
    }
  }

  const onSaveSubscribe = async () => {
    if (!subscriptionData) return
    const { shop, product, quantity, instruction, plan } = subscriptionData
    const { start_dates, repeat_unit, repeat_type: repeatType, repeat_month_type } = plan
    let repeat_type = repeatType
    if (repeat_month_type === 'sameDay') {
      const firstDate = start_dates[0]
      const firstDateDay = DayKeyVal[firstDate.getDay()]
      const firstDateNumToCheck = dayjs(firstDate).date()
      const firstDateNthWeek = Math.ceil(firstDateNumToCheck / 7)
      repeat_type = `${firstDateNthWeek}-${firstDateDay}` as RepeatType
    }
    const normalizedData = {
      product_id: product.id,
      shop_id: shop.id,
      buyer_id: user?.id,
      quantity,
      instruction,
      payment_method: 'cod',
      plan: {
        start_dates: start_dates.map((d: Date) => dayjs(d).format('YYYY-MM-DD')),
        repeat_unit,
        repeat_type,
      },
    }
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/productSubscriptionPlans`
      let method = 'POST'
      let res = await (
        await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${firebaseToken}`,
          },
          method,
          body: JSON.stringify(normalizedData),
        })
      ).json()
      console.log('res', res)
    } else {
      console.error('environment variable for the api does not exist.')
    }
    setSubscriptionData(undefined)
    setIsOpen(false)
  }

  if (!subscriptionData) return null

  return (
    <Modal
      title={`Subscribe to ${subscriptionData.product.name}`}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onSave={() => onSaveSubscribe()}
    >
      <div className="w-96">
        <span className="text-secondary-600">Shop</span>
        <p className="text-2xl">{subscriptionData.shop.name}</p>
        <div className="ml-2 border-b-1 mb-2 py-2 flex items-center">
          <div className="w-16 mr-2">
            <img
              src={subscriptionData.product.image}
              alt={subscriptionData.product.name}
              className="max-w-16 max-h-16"
            />
          </div>
          <div className="">
            <p>
              {`${subscriptionData.quantity} x ${subscriptionData.product.name} = ${formatToPeso(
                subscriptionData.quantity * subscriptionData.product.price
              )}`}{' '}
            </p>
            <button
              className="rounded px-1 bg-secondary-400 text-white mr-2"
              onClick={() => {
                if (subscriptionData.quantity > 1) {
                  setSubscriptionData({
                    ...subscriptionData,
                    quantity: subscriptionData.quantity - 1,
                  })
                }
              }}
            >
              -
            </button>
            <button
              className="rounded px-1 bg-primary-400 text-white mr-2"
              onClick={() =>
                setSubscriptionData({
                  ...subscriptionData,
                  quantity: subscriptionData.quantity + 1,
                })
              }
            >
              +
            </button>
          </div>
        </div>
        <TextField
          label="Instruction"
          type="text"
          size="small"
          onChange={(e) =>
            setSubscriptionData({ ...subscriptionData, instruction: e.target.value })
          }
          value={subscriptionData.instruction}
        />
        <div className="p-2 mb-10">
          <div className="flex items-center mb-5">
            <p>Every</p>
            <input
              className="border-2 w-10 mx-3"
              type="number"
              max="99"
              min="0"
              onChange={(e) => {
                setSubscriptionData({
                  ...subscriptionData,
                  plan: {
                    ...subscriptionData.plan,
                    repeat_unit: e.currentTarget.valueAsNumber,
                    start_dates: [defaultStartDate],
                  },
                })
              }}
              value={subscriptionData.plan.repeat_unit}
            />
            <Dropdown
              className="ml-2 z-10"
              simpleOptions={['day', 'week', 'month']}
              onSelect={(option) => {
                setSubscriptionData({
                  ...subscriptionData,
                  plan: {
                    ...subscriptionData.plan,
                    repeat_type: option.value as RepeatType,
                    start_dates: [defaultStartDate],
                  },
                })
              }}
              currentValue={subscriptionData.plan.repeat_type}
            />
          </div>
          {subscriptionData.plan.repeat_type === 'week' && (
            <div className="flex mb-5">
              {days.map((day) => (
                <button
                  className={`rounded-full border-2 w-10 h-10 m-2 capitalize ${
                    subscriptionData.plan.days.includes(day) ? 'bg-yellow-600 text-white' : ''
                  }`}
                  type="button"
                  onClick={() => {
                    if (subscriptionData.plan.days.includes(day)) {
                      setSubscriptionData({
                        ...subscriptionData,
                        plan: {
                          ...subscriptionData.plan,
                          days: subscriptionData.plan.days.filter((d: string) => d !== day),
                          start_dates: [defaultStartDate],
                        },
                      })
                    } else {
                      setSubscriptionData({
                        ...subscriptionData,
                        plan: {
                          ...subscriptionData.plan,
                          days: [...subscriptionData.plan.days, day],
                          start_dates: [defaultStartDate],
                        },
                      })
                    }
                  }}
                >
                  {day.slice(0, 1)}
                </button>
              ))}
            </div>
          )}
          {['day', 'week'].includes(subscriptionData.plan.repeat_type) && (
            <div className="flex mb-5 items-center">
              <p>Start Date</p>
              <div ref={startCalendarRef} className="relative">
                <button
                  className="rounded bg-primary-500 text-white ml-2 p-2"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                >
                  {dayjs(subscriptionData.plan.start_dates[0]).format('MMMM DD')}
                </button>
                {showStartCalendar && (
                  <ReactCalendar
                    className="w-72 absolute bottom-full left-0 z-20"
                    onChange={(date) => onClickStartDate(date as Date)}
                    value={subscriptionData.plan.start_dates[0] || null}
                    tileDisabled={tileDisabled}
                    calendarType="US"
                  />
                )}
              </div>
            </div>
          )}
          {subscriptionData.plan.repeat_type === 'month' && (
            <div className="mb-5">
              <span ref={startCalendarRef} className="relative">
                <button
                  className="rounded bg-primary-500 text-white p-2"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                >
                  Start Date
                </button>
                {showStartCalendar && (
                  <ReactCalendar
                    className="w-72 absolute bottom-full left-0 z-20"
                    onChange={(date) => {
                      setSubscriptionData({
                        ...subscriptionData,
                        plan: {
                          ...subscriptionData.plan,
                          start_dates: [date as Date],
                        },
                      })
                    }}
                    value={subscriptionData.plan.start_dates[0]}
                    tileDisabled={tileDisabled}
                    calendarType="US"
                  />
                )}
              </span>
              <div className="">
                <Checkbox
                  label={`${dayjs(subscriptionData.plan.start_dates[0]).format('Do')} of the month`}
                  onChange={() => {
                    setSubscriptionData({
                      ...subscriptionData,
                      plan: {
                        ...subscriptionData.plan,
                        repeat_month_type: 'sameDate',
                      },
                    })
                  }}
                  noMargin
                  value={subscriptionData.plan.repeat_month_type === 'sameDate'}
                />
                <Checkbox
                  label={`Every ${dayjs(
                    `2021-01-${Math.ceil(dayjs(subscriptionData.plan.start_dates[0]).date() / 7)}`
                  ).format('Do')} ${dayjs(subscriptionData.plan.start_dates[0]).format('dddd')}`}
                  onChange={() => {
                    setSubscriptionData({
                      ...subscriptionData,
                      plan: {
                        ...subscriptionData.plan,
                        repeat_month_type: 'sameDay',
                      },
                    })
                  }}
                  noMargin
                  value={subscriptionData.plan.repeat_month_type === 'sameDay'}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default CreateSubscriptionPlanModal

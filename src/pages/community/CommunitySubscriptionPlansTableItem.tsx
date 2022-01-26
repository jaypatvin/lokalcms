import dayjs from 'dayjs'
import React, { useState } from 'react'
import ReactCalendar from 'react-calendar'
import { OutlineButton } from '../../components/buttons'
import useOuterClick from '../../customHooks/useOuterClick'
import { ProductSubscriptionPlan } from '../../models'
import getAvailabilitySummary from '../../utils/dates/getAvailabilitySummary'
import getCalendarTileClassFn from '../../utils/dates/getCalendarTileClassFn'
import { formatToPeso } from '../../utils/helper'

type Props = {
  data: ProductSubscriptionPlan & {
    id: string
    buyer_email: string
    seller_email: string
    shop_name: string
  }
}

const CommunitySubscriptionPlanTableItem = ({ data }: Props) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const calendarRef = useOuterClick(() => setShowCalendar(false))

  const created_at = data.created_at ? dayjs(data.created_at.toDate()).fromNow() : '-'

  return (
    <tr>
      <td>
        <div className="border-b-1 mb-2 py-2 flex items-center">
          <div className="w-12 mr-2">
            {data.product.image ? (
              <img src={data.product.image} alt={data.product.name} className="max-w-12 max-h-12" />
            ) : (
              ''
            )}
          </div>
          <p>
            {`${data.product.name} (${data.quantity}) = ${formatToPeso(
              data.product.price * data.quantity
            )}`}{' '}
          </p>
        </div>
        <p>Total Price: {formatToPeso(data.product.price * data.quantity)}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.seller_email}</p>
        <p className="text-gray-900 whitespace-no-wrap">Shop: {data.shop_name}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.buyer_email}</p>
      </td>
      <td ref={calendarRef} className="relative">
        <p className="text-gray-900 whitespace-no-wrap flex">
          <OutlineButton
            className="h-8 text-primary-500 mr-1"
            size="small"
            icon="calendar"
            onClick={() => setShowCalendar(!showCalendar)}
          />
          {getAvailabilitySummary(data.plan)}
        </p>
        {showCalendar && (
          <div className="w-64 absolute z-10 shadow">
            <ReactCalendar
              tileClassName={getCalendarTileClassFn(data.plan)}
              onChange={() => null}
              calendarType="US"
            />
          </div>
        )}
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.status}</p>
        <p className="text-gray-900 whitespace-no-wrap">{data.payment_method}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{created_at}</p>
      </td>
    </tr>
  )
}

export default CommunitySubscriptionPlanTableItem

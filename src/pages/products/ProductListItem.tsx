import React, { useState } from 'react'
import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import ReactCalendar from 'react-calendar'
import useOuterClick from '../../customHooks/useOuterClick'
import { ListItemProps } from '../../utils/types'
import { OutlineButton } from '../../components/buttons'
import getAvailabilitySummary from '../../utils/dates/getAvailabilitySummary'
import getCalendarTileClassFn from '../../utils/dates/getCalendarTileClassFn'
import { Product } from '../../models'

dayjs.extend(advancedFormat)

type Props = Omit<ListItemProps, 'data'> & {
  data: Product & { user_email: string; shop_name: string }
}

const ProductListItem = ({
  data,
  openUpdate,
  onArchive,
  onUnarchive,
  hideDelete,
  isArchived = false,
}: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))
  const calendarRef = useOuterClick(() => setShowCalendar(false))

  let createdAt = '-'
  let createdAtAgo = '-'
  if (data.created_at) {
    createdAt = dayjs(data.created_at.toDate()).format()
    createdAtAgo = dayjs(createdAt).fromNow()
  }

  let updatedAt = '-'
  let updatedAtAgo = '-'
  if (data.updated_at) {
    updatedAt = dayjs(data.updated_at.toDate()).format()
    updatedAtAgo = dayjs(updatedAt).fromNow()
  }

  const OptionsComponent = isArchived ? (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          onUnarchive()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Unarchive
      </button>
    </div>
  ) : (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          openUpdate()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Edit
      </button>
      {!hideDelete && (
        <button
          className="block w-full p-2 hover:bg-gray-100 text-red-600"
          onClick={() => {
            if (onArchive) onArchive()
            setIsOptionsOpen(false)
          }}
        >
          Delete
        </button>
      )}
    </div>
  )

  return (
    <tr>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.name}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.description}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.user_email || data.user_id}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.shop_name || data.shop_id}</p>
      </td>
      <td ref={calendarRef} className="relative">
        <p className="text-gray-900 whitespace-no-wrap flex">
          <OutlineButton
            className="h-8 text-primary-500 mr-1"
            size="small"
            icon="calendar"
            onClick={() => setShowCalendar(!showCalendar)}
          />
          {getAvailabilitySummary(data.availability)}
        </p>
        {showCalendar && (
          <div className="w-64 absolute z-10 shadow">
            <ReactCalendar
              tileClassName={getCalendarTileClassFn(data.availability)}
              onChange={() => null}
              calendarType="US"
            />
          </div>
        )}
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.base_price}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.quantity}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.product_category}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.status}</p>
      </td>
      <td title={createdAt}>
        <p className="text-gray-900 whitespace-no-wrap">{createdAtAgo}</p>
      </td>
      <td title={updatedAt}>
        <p className="text-gray-900 whitespace-no-wrap">{updatedAtAgo}</p>
      </td>

      <td className="action-col">
        <div ref={optionsRef} className="relative">
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            type="button"
            className="inline-block text-gray-500 hover:text-gray-700"
          >
            <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
            </svg>
          </button>
          {isOptionsOpen && OptionsComponent}
        </div>
      </td>
    </tr>
  )
}

export default ProductListItem

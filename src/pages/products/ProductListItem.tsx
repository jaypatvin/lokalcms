import React, { useState } from 'react'
import dayjs from 'dayjs'
import useOuterClick from '../../customHooks/useOuterClick'
import { ListItemProps } from '../../utils/types'

const ProductListItem = ({
  data,
  openUpdate,
  onDelete,
  onUnarchive,
  hideDelete,
  isArchived = false,
}: ListItemProps) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  let created_at = '-'
  let created_at_ago = '-'
  if (data.created_at) {
    created_at = dayjs(data.created_at.toDate()).format()
    created_at_ago = dayjs(created_at).fromNow()
  }

  let updated_at = '-'
  let updated_at_ago = '-'
  if (data.updated_at) {
    updated_at = dayjs(data.updated_at.toDate()).format()
    updated_at_ago = dayjs(updated_at).fromNow()
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
            if (onDelete) onDelete()
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
      <td title={created_at}>
        <p className="text-gray-900 whitespace-no-wrap">{created_at_ago}</p>
      </td>
      <td title={updated_at}>
        <p className="text-gray-900 whitespace-no-wrap">{updated_at_ago}</p>
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

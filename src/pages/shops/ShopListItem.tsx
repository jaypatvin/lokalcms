import React, { useState } from 'react'
import dayjs from 'dayjs'
import useOuterClick from '../../customHooks/useOuterClick'

type Props = {
  shop: any
  openUpdateShop: () => void
  onDeleteShop: () => void
  onUnarchiveShop: () => void
  hideDelete?: boolean
  isArchived?: boolean
}

const ShopListItem = ({
  shop,
  openUpdateShop,
  onDeleteShop,
  onUnarchiveShop,
  hideDelete,
  isArchived = false,
}: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  let created_at = '-'
  let created_at_ago = '-'
  if (shop.created_at) {
    created_at = dayjs(shop.created_at.toDate()).format()
    created_at_ago = dayjs(created_at).fromNow()
  }

  let updated_at = '-'
  let updated_at_ago = '-'
  if (shop.updated_at) {
    updated_at = dayjs(shop.updated_at.toDate()).format()
    updated_at_ago = dayjs(updated_at).fromNow()
  }

  const OptionsComponent = isArchived ? (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          onUnarchiveShop()
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
          openUpdateShop()
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
            onDeleteShop()
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
        <p className="text-gray-900 whitespace-no-wrap">{shop.name}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{shop.description}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{shop.user_email || shop.user_id}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{shop.is_close ? 'true' : 'false'}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{shop.status}</p>
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

export default ShopListItem

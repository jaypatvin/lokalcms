import React, { useState } from 'react'
import dayjs from 'dayjs'
import useOuterClick from '../../customHooks/useOuterClick'
import { ListItemProps } from '../../utils/types'
import { Invite } from '../../models'

type Props = Omit<ListItemProps, 'data'> & { data: Invite & { inviter_email: string } }

const InviteListItem = ({
  data,
  openUpdate,
  onArchive,
  onUnarchive,
  hideDelete,
  isArchived = false,
}: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

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

  let expire_by = '-'
  if (data.expire_by) {
    expire_by = dayjs(data.expire_by).fromNow()
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
        <p className="text-gray-900 whitespace-no-wrap">{data.invitee_email}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">
          {data.inviter_email || data.inviter || '--'}
        </p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.code}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.status}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.claimed ? 'true' : 'false'}</p>
      </td>
      <td title={expire_by}>
        <p className="text-gray-900 whitespace-no-wrap">{expire_by}</p>
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

export default InviteListItem

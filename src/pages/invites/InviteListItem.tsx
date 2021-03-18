import React, { useState } from 'react'
import dayjs from 'dayjs'
import useOuterClick from '../../customHooks/useOuterClick'

type Props = {
  invite: any
  openUpdateInvite: () => void
  onDeleteInvite: () => void
  onUnarchiveInvite: () => void
  hideDelete?: boolean
  isArchived?: boolean
}

const InviteListItem = ({
  invite,
  openUpdateInvite,
  onDeleteInvite,
  onUnarchiveInvite,
  hideDelete,
  isArchived = false,
}: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  let _created_at = '-'
  let _created_at_ago = '-'
  if (invite.created_at) {
    _created_at = dayjs(invite.created_at.toDate()).format()
    _created_at_ago = dayjs(_created_at).fromNow()
  }

  let _expire_by = '-'
  if (invite.expire_by) {
    _expire_by = dayjs(invite.expire_by).fromNow()
  }

  const OptionsComponent = isArchived ? (
    <div className="absolute top-0 right-full shadow w-36 bg-white">
      <button
        onClick={() => {
          onUnarchiveInvite()
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
          openUpdateInvite()
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
            onDeleteInvite()
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
        <p className="text-gray-900 whitespace-no-wrap">{invite.invitee_email}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{invite.inviter_email || invite.inviter || '--'}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{invite.code}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{invite.status}</p>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{invite.claimed ? 'true' : 'false'}</p>
      </td>
      <td title={_expire_by}>
        <p className="text-gray-900 whitespace-no-wrap">{_expire_by}</p>
      </td>
      <td title={_created_at}>
        <p className="text-gray-900 whitespace-no-wrap">{_created_at_ago}</p>
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

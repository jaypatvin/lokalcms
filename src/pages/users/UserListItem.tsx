import React, { useState } from 'react'
import dayjs from 'dayjs'
import Avatar from '../../components/Avatar'
import useOuterClick from '../../customHooks/useOuterClick'
import { Link } from 'react-router-dom'
import { ListItemProps } from '../../utils/types'

const UserListItem = ({
  data,
  openUpdate,
  onArchive,
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

  const display_name =
    String(data.display_name).trim().length > 0 && typeof data.display_name !== 'undefined'
      ? data.display_name
      : data.first_name + ' ' + data.last_name
  let statusColor = 'gray'
  let statusText = 'Active'
  const _status =
    String(data.status).trim().length > 0 && typeof data.status !== 'undefined'
      ? data.status
      : 'undefined'

  switch (String(_status).toLowerCase()) {
    case 'active':
      statusColor = 'green'
      statusText = 'Active'
      break
    case 'suspended':
      statusColor = 'red'
      statusText = 'Suspended'
      break
    case 'pending':
      statusColor = 'yellow'
      statusText = 'Pending'
      break
    case 'locked':
      statusColor = 'gray'
      statusText = 'Locked'
      break
    case 'archived':
      statusColor = 'black'
      statusText = 'Archived'
      break
    default:
      statusColor = 'gray'
      break
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
      <Link to={`/users/${data.id}`} className="block w-full p-2 hover:bg-gray-100 text-center">
        View profile
      </Link>
      <button
        onClick={() => {
          openUpdate()
          setIsOptionsOpen(false)
        }}
        className="block w-full p-2 hover:bg-gray-100"
      >
        Quick Edit
      </button>
      <Link
        to={`/users/${data.id}/edit`}
        className="block w-full p-2 hover:bg-gray-100 text-center"
      >
        Edit
      </Link>
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
        <div className="flex">
          <Link to={`/users/${data.id}`}>
            <Avatar
              url={data.profile_photo}
              name={display_name}
              size={10}
              statusColor={statusColor}
            />
          </Link>
          <Link to={`/users/${data.id}`}>
            <div className="ml-3">
              <p className="text-gray-900 whitespace-no-wrap">{display_name}</p>
              <p className="text-gray-600 whitespace-no-wrap">{data.email}</p>
            </div>
          </Link>
        </div>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.community_name}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>
      <td>
        <span
          className={
            'relative inline-block px-3 py-1 font-semibold text-' +
            statusColor +
            '-900 leading-tight'
          }
        >
          <span
            aria-hidden
            className={'absolute inset-0 bg-' + statusColor + '-200 opacity-50 rounded-full'}
          ></span>
          <span className="relative">{statusText}</span>
        </span>
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

export default UserListItem

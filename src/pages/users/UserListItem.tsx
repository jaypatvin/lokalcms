import React, { useState } from 'react'
import dayjs from 'dayjs'
import Avatar from '../../components/Avatar'
import useOuterClick from '../../customHooks/useOuterClick'
import { Link } from 'react-router-dom'
import { ListItemProps } from '../../utils/types'
import { User } from '../../models'

type Props = Omit<ListItemProps, 'data'> & {
  data: User & {
    community_name: string
  }
}

const UserListItem = ({
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

  let statusColor = 'black'
  let statusText = 'Archived'

  if (!data.registration.verified) {
    statusColor = 'yellow'
    statusText = 'Pending'
  }

  if (!data.archived && data.registration.verified) {
    switch (data.status) {
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
      default:
        statusColor = 'gray'
        break
    }
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
              name={data.display_name}
              size={10}
              statusColor={statusColor}
            />
          </Link>
          <Link to={`/users/${data.id}`}>
            <div className="text-primary-600 hover:text-primary-400 ml-2">
              <p className="whitespace-no-wrap">{data.display_name}</p>
              <p className="whitespace-no-wrap opacity-60">{data.email}</p>
            </div>
          </Link>
        </div>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{data.community_name}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
      </td>
      <td>
        <p>
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
        </p>
        {data.registration.verified ? (
          <p className="text-primary-400 font-bold">Verified</p>
        ) : (
          <p className="text-secondary-500 font-bold">Unverified</p>
        )}
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

export default UserListItem

import React, { useState } from 'react'
import dayjs from 'dayjs'
import Avatar from '../../components/Avatar'
import useOuterClick from '../../customHooks/useOuterClick'
import { Link } from 'react-router-dom'

type Props = {
  user: any
  openUpdateUser: () => void
}

const UserListItem = ({ user, openUpdateUser }: Props) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const optionsRef = useOuterClick(() => setIsOptionsOpen(false))

  let _created_at = '-'
  let _created_at_ago = '-'
  if (user.created_at) {
    //_created_at = new Date(user.created_at.seconds * 1000).toLocaleDateString("en-US")
    _created_at = dayjs(user.created_at.toDate()).format()
    _created_at_ago = dayjs(_created_at).fromNow()
  }

  const display_name =
    String(user.display_name).trim().length > 0 && typeof user.display_name !== 'undefined'
      ? user.display_name
      : user.first_name + ' ' + user.last_name
  let statusColor = 'gray'
  let statusText = 'Active'
  const _status =
    String(user.status).trim().length > 0 && typeof user.status !== 'undefined'
      ? user.status
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
    default:
      statusColor = 'gray'
      break
  }

  return (
    <tr>
      <td>
        <div className="flex">
          <Avatar
            url={user.profile_photo}
            name={display_name}
            size={10}
            statusColor={statusColor}
          />
          <div className="ml-3">
            <p className="text-gray-900 whitespace-no-wrap">{display_name}</p>
            <p className="text-gray-600 whitespace-no-wrap">{user.email}</p>
          </div>
        </div>
      </td>
      <td>
        <p className="text-gray-900 whitespace-no-wrap">{user.community_name}</p>
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
      <td title={_created_at}>
        <p className="text-gray-900 whitespace-no-wrap">{_created_at_ago}</p>
        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
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
          {
            isOptionsOpen && (
              <div className="absolute top-0 right-full shadow w-36 bg-white">
                <button onClick={openUpdateUser} className="block w-full p-2 hover:bg-gray-100">Quick Edit</button>
                <Link to={`/users/${user.id}`} className="block w-full p-2 hover:bg-gray-100 text-center">Edit</Link>
                <button className="block w-full p-2 hover:bg-gray-100 text-red-600">Delete</button>
              </div>
            )
          }
        </div>
      </td>
    </tr>
  )
}

export default UserListItem

import React, { useState, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { auth, db } from '../../services/firebase'
import { Button } from '../../components/buttons'
import Avatar from '../../components/Avatar'

import { getUsers } from '../../services/users'
import { SortOrderType, UserRoleType, UserSortByType } from '../../utils/types'
import UserRoleMenu from './UserRoleMenu'
import SortButton from '../../components/buttons/SortButton'

// Init
dayjs.extend(relativeTime)

const UserListPage = (props: any) => {
  const [userList, setUserList] = useState<any>([])
  const [role, setRole] = useState<UserRoleType>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<UserSortByType>('first_name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState(50)

  useEffect(() => {
    getUsers({ role, search, sortBy, sortOrder, limit }).onSnapshot((snapshot) => {
      setUserList(
        snapshot.docs.map((doc) => {
          let _data = doc.data()
          _data.id = doc.id
          return _data
        })
      )
    })
  }, [role, search, sortBy, sortOrder, limit])

  const onSort = (sortName: UserSortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  return (
    <div className="flex flex-row w-full">
      <UserRoleMenu onSelect={setRole} />
      <div className="pb-8 flex-grow">
        <div className="-mb-2 pb-2 flex flex-wrap flex-grow justify-between">
          <div className="flex items-center">
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
              id="inline-searcg"
              type="text"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Button
              icon="add"
              size="small"
              onClick={(e: any) => {
                e.preventDefault()
                console.log('Add User')
                return false
              }}
            >
              New User
            </Button>
          </div>
        </div>
        <div className="table-wrapper">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="User"
                      showSortIcons={sortBy === 'first_name'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('first_name')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Community"
                      showSortIcons={sortBy === 'community_name'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('community_name')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Status"
                      showSortIcons={sortBy === 'status'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('status')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Member Since"
                      showSortIcons={sortBy === 'created_at'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('created_at')}
                    />
                  </th>
                  <th className="action-col"></th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user: any) => {
                  console.log(user)
                  let _created_at = '-'
                  let _created_at_ago = '-'
                  if (user.created_at) {
                    //_created_at = new Date(user.created_at.seconds * 1000).toLocaleDateString("en-US")
                    _created_at = dayjs(user.created_at.toDate()).format()
                    _created_at_ago = dayjs(_created_at).fromNow()
                  }

                  const display_name =
                    String(user.display_name).trim().length > 0 &&
                    typeof user.display_name !== 'undefined'
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
                            className={
                              'absolute inset-0 bg-' + statusColor + '-200 opacity-50 rounded-full'
                            }
                          ></span>
                          <span className="relative">{statusText}</span>
                        </span>
                      </td>
                      <td title={_created_at}>
                        <p className="text-gray-900 whitespace-no-wrap">{_created_at_ago}</p>
                        <p className="text-gray-600 whitespace-no-wrap">{''}</p>
                      </td>

                      <td className="action-col">
                        <button
                          type="button"
                          className="inline-block text-gray-500 hover:text-gray-700"
                        >
                          <svg className="inline-block h-6 w-6 fill-current" viewBox="0 0 24 24">
                            <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm-2 6a2 2 0 104 0 2 2 0 00-4 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserListPage

import React, { useState, useEffect } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { auth, db } from '../../services/firebase'
import { Button } from '../../components/buttons'
import Avatar from '../../components/Avatar'

import { getUsers } from '../../services/users'
import { LimitType, SortOrderType, UserRoleType, UserSortByType } from '../../utils/types'
import UserRoleMenu from './UserRoleMenu'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import Modal from '../../components/modals'
import { TextField } from '../../components/inputs'
import UserCreateUpdateForm from './UserCreateUpdateForm'

// Init
dayjs.extend(relativeTime)

const UserListPage = (props: any) => {
  const [userList, setUserList] = useState<any>([])
  const [role, setRole] = useState<UserRoleType>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<UserSortByType>('first_name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [usersRef, setUsersRef] = useState<any>()
  const [firstUserOnList, setFirstUserOnList] = useState<any>()
  const [lastUserOnList, setLastUserOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)

  const getUserList = async (docs: any[]) => {
    const newUserList = []
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      const _data = doc.data()
      _data.id = doc.id
      const community = await _data.community.get()
      const _community = community.data()
      _data.community_name = _community.name
      newUserList.push(_data)
    }
    setUserList(newUserList)
    setLastUserOnList(docs[docs.length - 1])
    setFirstUserOnList(docs[0])
  }

  useEffect(() => {
    const newUsersRef = getUsers({ role, search, sortBy, sortOrder, limit })
    newUsersRef.onSnapshot(async (snapshot) => {
      getUserList(snapshot.docs)
    })
    setUsersRef(newUsersRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [role, search, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (usersRef && lastUserOnList) {
      const newUsersRef = usersRef.startAfter(lastUserOnList).limit(limit)
      newUsersRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getUserList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (usersRef && firstUserOnList && newPageNum > 0) {
      const newUsersRef = usersRef.endBefore(firstUserOnList).limitToLast(limit)
      newUsersRef.onSnapshot(async (snapshot: any) => {
        getUserList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: UserSortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  const openCreateUser = () => {
    setIsCreateUserOpen(true)
  }

  return (
    <div className="flex flex-row w-full">
      <UserCreateUpdateForm isOpen={isCreateUserOpen} setIsOpen={setIsCreateUserOpen} />
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
            <div className="flex justify-between align-middle ml-4">
              <div className="flex items-center">
                Show:{' '}
                <Dropdown
                  className="ml-1"
                  simpleOptions={[10, 25, 50, 100]}
                  onSelect={(option: any) => setLimit(option.value)}
                  currentValue={limit}
                  size="small"
                />
              </div>
              <Button
                className="ml-5"
                icon="arrowBack"
                size="small"
                color={pageNum === 1 ? 'secondary' : 'primary'}
                onClick={onPreviousPage}
              />
              <Button
                className="ml-3"
                icon="arrowForward"
                size="small"
                color={isLastPage ? 'secondary' : 'primary'}
                onClick={onNextPage}
              />
            </div>
          </div>
          <div className="flex items-center">
            <Button icon="add" size="small" onClick={openCreateUser}>
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
                    <tr key={user.id}>
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

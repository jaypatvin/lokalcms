import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../../components/buttons'
import { getUsers } from '../../services/users'
import { LimitType, SortOrderType, UserFilterType, UserSortByType } from '../../utils/types'
import UserRoleMenu from './UserRoleMenu'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import UserCreateUpdateForm from './UserCreateUpdateForm'
import UserListItems from './UserListItems'

// Init
dayjs.extend(relativeTime)

const UserListPage = (props: any) => {
  const [userList, setUserList] = useState<any>([])
  const [filter, setFilter] = useState<UserFilterType>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<UserSortByType>('display_name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [usersRef, setUsersRef] = useState<any>()
  const [firstUserOnList, setFirstUserOnList] = useState<any>()
  const [lastUserOnList, setLastUserOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [userModalMode, setUserModalMode] = useState<'create' | 'update'>('create')
  const [userToUpdate, setUserToUpdate] = useState<any>()

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
    const newUsersRef = getUsers({ filter, search, sortBy, sortOrder, limit })
    newUsersRef.onSnapshot(async (snapshot) => {
      getUserList(snapshot.docs)
    })
    setUsersRef(newUsersRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [filter, search, sortBy, sortOrder, limit])

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
    setUserModalMode('create')
    setUserToUpdate(undefined)
  }

  const openUpdateUser = (user: any) => {
    setIsCreateUserOpen(true)
    setUserModalMode('update')
    const data = {
      id: user.id,
      status: user.status,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name,
      community_id: user.community_id,
      profile_photo: user.profile_photo,
      street: user.address.street,
      is_admin: user.roles.admin,
    }
    setUserToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateUserOpen && (
        <UserCreateUpdateForm
          isOpen={isCreateUserOpen}
          setIsOpen={setIsCreateUserOpen}
          userToUpdate={userToUpdate}
          mode={userModalMode}
        />
      )}
      <UserRoleMenu onSelect={setFilter} />
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
                      showSortIcons={sortBy === 'display_name'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('display_name')}
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
                <UserListItems users={userList} openUpdateUser={openUpdateUser} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserListPage

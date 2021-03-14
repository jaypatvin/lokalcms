import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../../components/buttons'
import { CommunityFilterType, CommunitySortByType, LimitType, SortOrderType } from '../../utils/types'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import CommunityCreateUpdateForm from './CommunityCreateUpdateForm'
import CommunityListItems from './CommunityListItems'
import { communityHaveMembers, getCommunities, getCommunityMeta } from '../../services/community'
import CommunityMenu from './CommunityMenu'
import { fetchUserByID } from '../../services/users'

// Init
dayjs.extend(relativeTime)

const CommunityListPage = (props: any) => {
  const [communityList, setCommunityList] = useState<any>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CommunityFilterType>('all')
  const [sortBy, setSortBy] = useState<CommunitySortByType>('name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [communitiesRef, setCommunitiesRef] = useState<any>()
  const [snapshot, setSnapshot] = useState<any>()
  const [firstCommunityOnList, setFirstCommunityOnList] = useState<any>()
  const [lastCommunityOnList, setLastCommunityOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false)
  const [communityModalMode, setCommunityModalMode] = useState<'create' | 'update'>('create')
  const [communityToUpdate, setCommunityToUpdate] = useState<any>()

  const getCommunityList = async (docs: any[]) => {
    const newList = docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    for (let i = 0; i < newList.length; i++) {
      const community = newList[i]
      community.haveMembers = await communityHaveMembers(community.id)
      community.meta = await getCommunityMeta(community.id)
      const admins = []
      if (community.admin && community.admin.length) {
        for (let i = 0; i < community.admin.length; i++) {
          const adminId = community.admin[i]
          const admin = await fetchUserByID(adminId)
          const adminData = admin.data()
          if (adminData) admins.push(adminData)
        }
      }
      community.admins = admins
    }

    setCommunityList(newList)
    setLastCommunityOnList(docs[docs.length - 1])
    setFirstCommunityOnList(docs[0])
  }

  useEffect(() => {
    const newCommunitiesRef = getCommunities({ search, filter, sortBy, sortOrder, limit })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newCommunitiesRef.onSnapshot((snapshot) => {
      getCommunityList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setCommunitiesRef(newCommunitiesRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [search, filter, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (communitiesRef && lastCommunityOnList) {
      const newCommunitiesRef = communitiesRef.startAfter(lastCommunityOnList).limit(limit)
      newCommunitiesRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getCommunityList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (communitiesRef && firstCommunityOnList && newPageNum > 0) {
      const newCommunitiesRef = communitiesRef.endBefore(firstCommunityOnList).limitToLast(limit)
      newCommunitiesRef.onSnapshot(async (snapshot: any) => {
        getCommunityList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: CommunitySortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  const openCreateCommunity = () => {
    setIsCreateCommunityOpen(true)
    setCommunityModalMode('create')
    setCommunityToUpdate(undefined)
  }

  const openUpdateCommunity = (community: any) => {
    setIsCreateCommunityOpen(true)
    setCommunityModalMode('update')
    const data = {
      id: community.id,
      name: community.name,
      cover_photo: community.cover_photo,
      profile_photo: community.profile_photo,
      admin: community.admin,
      ...community.address,
    }
    setCommunityToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateCommunityOpen && (
        <CommunityCreateUpdateForm
          isOpen={isCreateCommunityOpen}
          setIsOpen={setIsCreateCommunityOpen}
          communityToUpdate={communityToUpdate}
          mode={communityModalMode}
        />
      )}
      <CommunityMenu selected={filter} onSelect={setFilter} />
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
            <Button icon="add" size="small" onClick={openCreateCommunity}>
              New Community
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
                      label="Name"
                      showSortIcons={sortBy === 'name'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('name')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Address"
                      showSortIcons={sortBy === 'subdivision'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('subdivision')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Admins"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="# of users"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="# of shops"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="# of products"
                      showSortIcons={false}
                    />
                  </th>
                  <th className="action-col"></th>
                </tr>
              </thead>
              <tbody>
                <CommunityListItems
                  communities={communityList}
                  openUpdateCommunity={openUpdateCommunity}
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityListPage

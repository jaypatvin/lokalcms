import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Button } from '../../components/buttons'
import { InviteFilterType, InviteSortByType, LimitType, SortOrderType } from '../../utils/types'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import InviteCreateUpdateForm from './InviteCreateUpdateForm'
import InviteListItems from './InviteListItems'
import InviteMenu from './InviteMenu'
import { getInvites } from '../../services/invites'

// Init
dayjs.extend(relativeTime)

const InviteListPage = (props: any) => {
  const [inviteList, setInviteList] = useState<any>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<InviteFilterType>('all')
  const [sortBy, setSortBy] = useState<InviteSortByType>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc')
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [invitesRef, setInvitesRef] = useState<any>()
  const [snapshot, setSnapshot] = useState<any>()
  const [firstInviteOnList, setFirstInviteOnList] = useState<any>()
  const [lastInviteOnList, setLastInviteOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false)
  const [inviteModalMode, setInviteModalMode] = useState<'create' | 'update'>('create')
  const [inviteToUpdate, setInviteToUpdate] = useState<any>()

  const getInviteList = async (docs: any[]) => {
    const newList = docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    setInviteList(newList)
    setLastInviteOnList(docs[docs.length - 1])
    setFirstInviteOnList(docs[0])
  }

  useEffect(() => {
    const newInvitesRef = getInvites({ search, filter, sortBy, sortOrder, limit })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newInvitesRef.onSnapshot((snapshot: any) => {
      getInviteList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setInvitesRef(newInvitesRef)
    setPageNum(1)
    setIsLastPage(false)
  }, [search, filter, sortBy, sortOrder, limit])

  const onNextPage = () => {
    if (invitesRef && lastInviteOnList) {
      const newInvitesRef = invitesRef.startAfter(lastInviteOnList).limit(limit)
      newInvitesRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          getInviteList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (invitesRef && firstInviteOnList && newPageNum > 0) {
      const newInvitesRef = invitesRef.endBefore(firstInviteOnList).limitToLast(limit)
      newInvitesRef.onSnapshot(async (snapshot: any) => {
        getInviteList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  const onSort = (sortName: InviteSortByType) => {
    if (sortName === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(sortName)
      setSortOrder('asc')
    }
  }

  const openCreateInvite = () => {
    setIsCreateInviteOpen(true)
    setInviteModalMode('create')
    setInviteToUpdate(undefined)
  }

  const openUpdateInvite = (invite: any) => {
    setIsCreateInviteOpen(true)
    setInviteModalMode('update')
    const data = {
      id: invite.id,
      invitee_email: invite.invitee_email,
      inviter: invite.inviter,
      expire_by: invite.expire_by,
      code: invite.code,
      status: invite.status,
      claimed: invite.claimed,
    }
    setInviteToUpdate(data)
  }

  return (
    <div className="flex flex-row w-full">
      {isCreateInviteOpen && (
        <InviteCreateUpdateForm
          isOpen={isCreateInviteOpen}
          setIsOpen={setIsCreateInviteOpen}
          inviteToUpdate={inviteToUpdate}
          mode={inviteModalMode}
        />
      )}
      <InviteMenu selected={filter} onSelect={setFilter} />
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
            <Button icon="add" size="small" onClick={openCreateInvite}>
              Invite
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
                      label="Invitee Email"
                      showSortIcons={sortBy === 'invitee_email'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('invitee_email')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Inviter"
                      showSortIcons={false}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Code"
                      showSortIcons={false}
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
                      label="Claimed"
                      showSortIcons={sortBy === 'claimed'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('claimed')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Expire By"
                      showSortIcons={sortBy === 'expire_by'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('expire_by')}
                    />
                  </th>
                  <th>
                    <SortButton
                      className="text-xs uppercase font-bold"
                      label="Created At"
                      showSortIcons={sortBy === 'created_at'}
                      currentSortOrder={sortOrder}
                      onClick={() => onSort('created_at')}
                    />
                  </th>
                  <th className="action-col"></th>
                </tr>
              </thead>
              <tbody>
                <InviteListItems invites={inviteList} openUpdateInvite={openUpdateInvite} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InviteListPage

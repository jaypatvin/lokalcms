import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { Button } from '../../components/buttons'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getApplicationLogs } from '../../services/applicationLogs'
import { getCommunities } from '../../services/community'
import { fetchUserByID, getUsers } from '../../services/users'
import { formatFirestoreDatesAgo } from '../../utils/dates/formatDate'
import { LimitType } from '../../utils/types'

const ApplicationLogsPage = () => {
  const [applicationLogs, setApplicationLogs] = useState<any>([])

  const [community, setCommunity] = useState<any>()
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<any>([])

  const [user, setUser] = useState<any>()
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<any>([])

  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)

  const [dataRef, setDataRef] = useState<any>()
  const [firstDataOnList, setFirstDataOnList] = useState<any>()
  const [lastDataOnList, setLastDataOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)

  const [snapshot, setSnapshot] = useState<{ unsubscribe: () => void }>()

  useEffect(() => {
    getCommunityApplicationLogs()
  }, [community, limit, user])

  const communitySearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setCommunitySearchText(e.target.value)
    if (e.target.value.length > 2) {
      const communitiesRef = getCommunities({ search: e.target.value })
      const result = await communitiesRef.get()
      const communities = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setCommunitySearchResult(communities)
      setShowCommunitySearchResult(communities.length > 0)
    } else {
      setShowCommunitySearchResult(false)
      setCommunitySearchResult([])
    }
  }

  const communitySelectHandler = (community: any) => {
    setShowCommunitySearchResult(false)
    setCommunitySearchResult([])
    setCommunity(community)
    setCommunitySearchText(community.name)
  }

  const userSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setUserSearchText(e.target.value)
    if (e.target.value.length > 2) {
      const usersRef = getUsers({ search: e.target.value })
      const result = await usersRef.get()
      const users = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setUserSearchResult(users)
      setShowUserSearchResult(users.length > 0)
    } else {
      setShowUserSearchResult(false)
      setUserSearchResult([])
    }
  }

  const userSelectHandler = (user: any) => {
    setShowUserSearchResult(false)
    setUserSearchResult([])
    setUser(user)
    setUserSearchText(user.email)
  }

  const setupDataList = async (docs: any) => {
    const data = []
    for (let log of docs) {
      const user = await fetchUserByID(log.user_id)
      data.push({
        ...log.data(),
        id: log.id,
        user_email: user.data()?.email,
      })
    }
    setApplicationLogs(data)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
  }

  const getCommunityApplicationLogs = async () => {
    if (!community) return
    const dataRef = getApplicationLogs({
      community_id: community.id,
      limit,
    })
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = dataRef.onSnapshot(async (snapshot) => {
      setupDataList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setDataRef(dataRef)
    setPageNum(1)
    setIsLastPage(false)
  }

  const onNextPage = () => {
    if (dataRef && lastDataOnList && !isLastPage) {
      const newDataRef = dataRef.startAfter(lastDataOnList).limit(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          setupDataList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (dataRef && firstDataOnList && newPageNum > 0) {
      const newDataRef = dataRef.endBefore(firstDataOnList).limitToLast(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        setupDataList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  return (
    <div className="">
      <div className="flex items-center my-5 w-full">
        <div ref={communitySearchResultRef} className="relative">
          <TextField
            label="Community"
            required
            type="text"
            size="small"
            placeholder="Search"
            onChange={communitySearchHandler}
            value={communitySearchText}
            onFocus={() => setShowCommunitySearchResult(communitySearchResult.length > 0)}
            noMargin
          />
          {showCommunitySearchResult && communitySearchResult.length > 0 && (
            <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
              {communitySearchResult.map((community: any) => (
                <button
                  className="w-full p-1 hover:bg-gray-200 block text-left"
                  key={community.id}
                  onClick={() => communitySelectHandler(community)}
                >
                  {community.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div ref={userSearchResultRef} className="relative">
          <TextField
            label="User"
            type="text"
            size="small"
            placeholder="Search"
            onChange={userSearchHandler}
            value={userSearchText}
            onFocus={() => setShowUserSearchResult(userSearchResult.length > 0)}
            noMargin
          />
          {showUserSearchResult && userSearchResult.length > 0 && (
            <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
              {userSearchResult.map((user: any) => (
                <button
                  className="w-full p-1 hover:bg-gray-200 block text-left"
                  key={user.id}
                  onClick={() => userSelectHandler(user)}
                >
                  {user.email}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center">
          Show:{' '}
          <Dropdown
            className="ml-1 z-10"
            simpleOptions={[10, 25, 50, 100]}
            size="small"
            onSelect={(option: any) => setLimit(option.value)}
            currentValue={limit}
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
      <div className="table-wrapper w-full overflow-x-auto">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th key="action">
                  <SortButton
                    className="text-xs uppercase font-bold"
                    label="Action"
                    showSortIcons={false}
                  />
                </th>
                <th key="user">
                  <SortButton
                    className="text-xs uppercase font-bold"
                    label="User"
                    showSortIcons={false}
                  />
                </th>
                <th key="device_id">
                  <SortButton
                    className="text-xs uppercase font-bold"
                    label="Device ID"
                    showSortIcons={false}
                  />
                </th>
                <th key="document">
                  <SortButton
                    className="text-xs uppercase font-bold"
                    label="Document ID"
                    showSortIcons={false}
                  />
                </th>
                <th key="created_at">
                  <SortButton
                    className="text-xs uppercase font-bold"
                    label="Created At"
                    showSortIcons={false}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {applicationLogs.map((data: any) => (
                <tr>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{data.action_type}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{data.user_email}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{data.device_id}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">{data.associated_document}</p>
                  </td>
                  <td>
                    <p className="text-gray-900 whitespace-no-wrap">
                      {formatFirestoreDatesAgo(data.created_at)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ApplicationLogsPage
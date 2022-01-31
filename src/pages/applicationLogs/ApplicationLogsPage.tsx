import React, { ChangeEventHandler, useEffect, useState } from 'react'
import { useCommunity } from '../../components/BasePage'
import { Button } from '../../components/buttons'
import SortButton from '../../components/buttons/SortButton'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { ActionType, ApplicationLog, User } from '../../models'
import { getActionTypes } from '../../services/actionTypes'
import { getApplicationLogs } from '../../services/applicationLogs'
import { fetchUserByID, getUsers } from '../../services/users'
import { formatFirestoreDatesAgo } from '../../utils/dates/formatDate'
import { LimitType } from '../../utils/types'

type UserData = User & { id: string }
type ActionTypeData = ActionType & { id: string }
type ApplicationLogData = ApplicationLog & { id: string; user_email: string }

const ApplicationLogsPage = () => {
  const [applicationLogs, setApplicationLogs] = useState<ApplicationLogData[]>([])

  const [user, setUser] = useState<UserData>()
  const [showUserSearchResult, setShowUserSearchResult] = useState(false)
  const userSearchResultRef = useOuterClick(() => setShowUserSearchResult(false))
  const [userSearchText, setUserSearchText] = useState('')
  const [userSearchResult, setUserSearchResult] = useState<UserData[]>([])

  const [actionTypes, setActionTypes] = useState<ActionTypeData[]>()
  const [actionType, setActionType] = useState<ActionTypeData>()
  const [showActionTypeSearchResult, setShowActionTypeSearchResult] = useState(false)
  const actionTypeSearchResultRef = useOuterClick(() => setShowActionTypeSearchResult(false))
  const [actionTypeSearchText, setActionTypeSearchText] = useState('')
  const [actionTypeSearchResult, setActionTypeSearchResult] = useState<ActionTypeData[]>([])

  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)

  const [dataRef, setDataRef] = useState<firebase.default.firestore.Query<ApplicationLog>>()
  const [firstDataOnList, setFirstDataOnList] =
    useState<firebase.default.firestore.QueryDocumentSnapshot<ApplicationLog>>()
  const [lastDataOnList, setLastDataOnList] =
    useState<firebase.default.firestore.QueryDocumentSnapshot<ApplicationLog>>()
  const [isLastPage, setIsLastPage] = useState(false)

  const community = useCommunity()

  const [snapshot, setSnapshot] = useState<{ unsubscribe: () => void }>()

  useEffect(() => {
    getActionTypes()
      .get()
      .then((data) => {
        const newActionTypes = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
        setActionTypes(newActionTypes)
      })
  }, [])

  useEffect(() => {
    getCommunityApplicationLogs()
  }, [community, limit, user, actionType])

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

  const userSelectHandler = (user: UserData) => {
    setShowUserSearchResult(false)
    setUserSearchResult([])
    setUser(user)
    setUserSearchText(user.email)
  }

  const actionTypeSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setActionTypeSearchText(e.target.value)
    if (actionTypes) {
      const filteredActionTypes = actionTypes.filter((action) =>
        action.name.toLowerCase().includes(e.target.value)
      )
      setActionTypeSearchResult(filteredActionTypes)
      setShowActionTypeSearchResult(filteredActionTypes.length > 0)
    }
  }

  const actionTypeSelectHandler = (actionType: ActionTypeData) => {
    setShowActionTypeSearchResult(false)
    setActionTypeSearchResult([])
    setActionType(actionType)
    setActionTypeSearchText(actionType.name)
  }

  const setupDataList = async (docs: firebase.default.firestore.QueryDocumentSnapshot<ApplicationLog>[]) => {
    const data: ApplicationLogData[] = []
    for (let log of docs) {
      const logData = log.data()
      let user
      if (logData.user_id) {
        user = await fetchUserByID(logData.user_id)
      }
      data.push({
        ...log.data(),
        id: log.id,
        user_email: user?.data()?.email ?? '--',
      })
    }
    setApplicationLogs(data)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
  }

  const getCommunityApplicationLogs = async () => {
    if (!community || !community.id) return
    const dataRef = getApplicationLogs({
      community_id: community.id,
      limit,
      action_type: actionType?.id,
      user_id: user?.id,
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
      newDataRef.onSnapshot(async (snapshot) => {
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
      newDataRef.onSnapshot(async (snapshot) => {
        setupDataList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  return (
    <div className="">
      <div className="flex justify-between px-3">
        <div className="flex items-center my-5 w-full">
          <div ref={userSearchResultRef} className="relative ml-2">
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
                {userSearchResult.map((user) => (
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
          <div ref={actionTypeSearchResultRef} className="relative ml-2">
            <TextField
              label="Action Type"
              type="text"
              size="small"
              placeholder="Search"
              onChange={actionTypeSearchHandler}
              value={actionTypeSearchText}
              onFocus={() => setShowActionTypeSearchResult(actionTypeSearchResult.length > 0)}
              noMargin
            />
            {showActionTypeSearchResult && actionTypeSearchResult.length > 0 && (
              <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
                {actionTypeSearchResult.map((action) => (
                  <button
                    className="w-full p-1 hover:bg-gray-200 block text-left"
                    key={action.id}
                    onClick={() => actionTypeSelectHandler(action)}
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          Show:{' '}
          <Dropdown
            className="ml-1 z-10"
            simpleOptions={[10, 25, 50, 100]}
            size="small"
            onSelect={(option) => setLimit(option.value as LimitType)}
            currentValue={limit}
          />
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
      {!community || !community.id ? (
        <h2 className="text-xl ml-5">Select a community first</h2>
      ) : (
        <div className="table-wrapper w-full">
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
                {applicationLogs.map((data) => (
                  <tr key={data.id}>
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
      )}
    </div>
  )
}

export default ApplicationLogsPage

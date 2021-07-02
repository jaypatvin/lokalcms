import React, { ChangeEventHandler, useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getCommunities } from '../../services/community'
import { getOrders } from '../../services/orders'
import { getOrderStatuses } from '../../services/orderStatus'
import { LimitType } from '../../utils/types'
import OrderDetails from './OrderDetails'

const OrdersPage = ({}) => {
  const [community, setCommunity] = useState<any>()
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<any>([])
  const [orders, setOrders] = useState<any[]>([])
  const [ordersSnapshot, setOrdersSnapshot] = useState<{ unsubscribe: () => void }>()
  const [loading, setLoading] = useState(false)
  const [orderStatusMap, setOrderStatusMap] = useState<any>({})
  const [orderStatuses, setOrderStatuses] = useState<any[]>([])

  const [statusCode, setStatusCode] = useState<number>()
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [dataRef, setDataRef] = useState<any>()
  const [firstDataOnList, setFirstDataOnList] = useState<any>()
  const [lastDataOnList, setLastDataOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)

  useEffect(() => {
    getOrderStatuses()
      .get()
      .then((statuses) => {
        const allStatusMap = statuses.docs.reduce<any>((obj, doc) => {
          obj[doc.id] = doc.data()
          return obj
        }, {})
        setOrderStatusMap(allStatusMap)
        const allStatuses = statuses.docs.map((doc) => ({
          key: doc.id,
          label: doc.data().buyer_status,
        }))
        allStatuses.sort((a, b) => (parseInt(a.key) > parseInt(b.key) ? 1 : -1))
        setOrderStatuses(allStatuses)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    getCommunityOrders(community)
  }, [statusCode, community, limit])

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
    getCommunityOrders(community)
  }

  const setupDataList = (docs: any) => {
    const newOrders = docs.map((doc: any): any => ({
      id: doc.id,
      ...doc.data(),
    }))
    setOrders(newOrders)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
    setLoading(false)
  }

  const getCommunityOrders = async (community: any) => {
    if (!community) return
    setLoading(true)
    const ordersRef = getOrders({
      community_id: community.id,
      status_code: statusCode,
      limit,
    })
    if (ordersSnapshot && ordersSnapshot.unsubscribe) ordersSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = ordersRef.onSnapshot(async (snapshot) => {
      setupDataList(snapshot.docs)
    })
    setOrdersSnapshot({ unsubscribe: newUnsubscribe })
    setDataRef(ordersRef)
    setPageNum(1)
    setIsLastPage(false)
  }

  const onNextPage = () => {
    if (dataRef && lastDataOnList && !isLastPage) {
      setLoading(true)
      const newDataRef = dataRef.startAfter(lastDataOnList).limit(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        if (snapshot.docs.length) {
          setupDataList(snapshot.docs)
          setPageNum(pageNum + 1)
        } else if (!isLastPage) {
          setLoading(false)
          setIsLastPage(true)
        }
      })
    }
  }

  const onPreviousPage = () => {
    const newPageNum = pageNum - 1
    if (dataRef && firstDataOnList && newPageNum > 0) {
      setLoading(true)
      const newDataRef = dataRef.endBefore(firstDataOnList).limitToLast(limit)
      newDataRef.onSnapshot(async (snapshot: any) => {
        setupDataList(snapshot.docs)
      })
    }
    setIsLastPage(false)
    setPageNum(Math.max(1, newPageNum))
  }

  return (
    <>
      <h2 className="text-2xl font-semibold leading-tight">Orders</h2>
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
        <Dropdown
          name="Status"
          className="ml-2 z-10"
          options={orderStatuses}
          size="small"
          onSelect={(option: any) => setStatusCode(parseInt(option.key))}
          currentValue={statusCode ? orderStatusMap[statusCode].buyer_status : null}
          showLabel
        />
        <div className="flex justify-between align-middle ml-4">
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
      </div>
      <div className="flex">
        {loading ? (
          <div className="h-96 w-full relative">
            <ReactLoading
              type="spin"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              color="gray"
            />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto mb-10">
            {orders.map((order) => (
              <OrderDetails key={order.id} orderStatusMap={orderStatusMap} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default OrdersPage

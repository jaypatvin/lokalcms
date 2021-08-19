import React, { ChangeEventHandler, useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getCommunities } from '../../services/community'
import { getProductSubscriptionPlans } from '../../services/productSubscriptionPlans'
import { fetchUserByID } from '../../services/users'
import { LimitType } from '../../utils/types'
import ProductSubscriptionPlanDetails from './ProductSubscriptionPlanDetails'

const ProductSubscriptionPlansPage = () => {
  const [community, setCommunity] = useState<any>()
  const [showCommunitySearchResult, setShowCommunitySearchResult] = useState(false)
  const communitySearchResultRef = useOuterClick(() => setShowCommunitySearchResult(false))
  const [communitySearchText, setCommunitySearchText] = useState('')
  const [communitySearchResult, setCommunitySearchResult] = useState<any>([])
  const [productSubscriptionPlans, setProductSubscriptionPlans] = useState<any[]>([])
  const [productSubscriptionPlansSnapshot, setProductSubscriptionPlansSnapshot] =
    useState<{ unsubscribe: () => void }>()
  const [loading, setLoading] = useState(false)

  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)
  const [dataRef, setDataRef] = useState<any>()
  const [firstDataOnList, setFirstDataOnList] = useState<any>()
  const [lastDataOnList, setLastDataOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)

  useEffect(() => {
    getCommunityProductSubscriptionPlans(community)
  }, [community, limit])

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
    getCommunityProductSubscriptionPlans(community)
  }

  const setupDataList = async (docs: any) => {
    const newProductSubscriptionPlans = docs.map((doc: any): any => ({
      id: doc.id,
      ...doc.data(),
    }))
    for (let productSubscription of newProductSubscriptionPlans) {
      const buyer = (await fetchUserByID(productSubscription.buyer_id)).data()
      productSubscription.buyer_email = buyer?.email
    }
    for (let productSubscription of newProductSubscriptionPlans) {
      const seller = (await fetchUserByID(productSubscription.seller_id)).data()
      productSubscription.seller_email = seller?.email
    }
    setProductSubscriptionPlans(newProductSubscriptionPlans)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
    setLoading(false)
  }

  const getCommunityProductSubscriptionPlans = async (community: any) => {
    if (!community) return
    setLoading(true)
    const ordersRef = getProductSubscriptionPlans({
      community_id: community.id,
      limit,
    })
    if (productSubscriptionPlansSnapshot && productSubscriptionPlansSnapshot.unsubscribe)
      productSubscriptionPlansSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = ordersRef.onSnapshot(async (snapshot) => {
      setupDataList(snapshot.docs)
    })
    setProductSubscriptionPlansSnapshot({ unsubscribe: newUnsubscribe })
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
      <h2 className="text-2xl font-semibold leading-tight">Product Subscription Plans</h2>
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
            {productSubscriptionPlans.map((subscriptionPlan) => (
              <ProductSubscriptionPlanDetails subscriptionPlan={subscriptionPlan} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ProductSubscriptionPlansPage

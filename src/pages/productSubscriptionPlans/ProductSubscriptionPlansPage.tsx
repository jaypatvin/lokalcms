import React, { ChangeEventHandler, useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import { useCommunity } from '../../components/BasePage'
import { Button } from '../../components/buttons'
import Dropdown from '../../components/Dropdown'
import { TextField } from '../../components/inputs'
import useOuterClick from '../../customHooks/useOuterClick'
import { getProducts } from '../../services/products'
import { getProductSubscriptionPlans } from '../../services/productSubscriptionPlans'
import { getShops } from '../../services/shops'
import { fetchUserByID } from '../../services/users'
import { LimitType } from '../../utils/types'
import ProductSubscriptionPlanDetails from './ProductSubscriptionPlanDetails'
import ProductSubscriptions from './ProductSubscriptions'

const ProductSubscriptionPlansPage = () => {
  const community = useCommunity()

  const [shop, setShop] = useState<any>({})
  const [showShopSearchResult, setShowShopSearchResult] = useState(false)
  const shopSearchResultRef = useOuterClick(() => setShowShopSearchResult(false))
  const [shopSearchText, setShopSearchText] = useState('')
  const [shopSearchResult, setShopSearchResult] = useState<any>([])

  const [product, setProduct] = useState<any>({})
  const [showProductSearchResult, setShowProductSearchResult] = useState(false)
  const productSearchResultRef = useOuterClick(() => setShowProductSearchResult(false))
  const [productSearchText, setProductSearchText] = useState('')
  const [productSearchResult, setProductSearchResult] = useState<any>([])

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

  const [showSubscriptions, setShowSubscriptions] = useState(false)
  const [activeSubscriptionPlan, setActiveSubscriptionPlan] = useState<any>()

  useEffect(() => {
    if (community && community.id) {
      getCommunityProductSubscriptionPlans(community.id)
    }
  }, [community, limit])

  const shopSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setShopSearchText(e.target.value)
    if (e.target.value.length > 2) {
      const shopsRef = getShops({ search: e.target.value })
      const result = await shopsRef.get()
      const shops = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setShopSearchResult(shops)
      setShowShopSearchResult(shops.length > 0)
    } else {
      setShowShopSearchResult(false)
      setShopSearchResult([])
    }
  }

  const shopSelectHandler = (shop: any) => {
    setShowShopSearchResult(false)
    setShopSearchResult([])
    setShop(shop)
    setShopSearchText(shop.name)
    getCommunityProductSubscriptionPlans(community.id, shop.id, product.id)
  }

  const productSearchHandler: ChangeEventHandler<HTMLInputElement> = async (e) => {
    setProductSearchText(e.target.value)
    if (e.target.value.length > 2) {
      const productsRef = getProducts({ search: e.target.value })
      const result = await productsRef.get()
      const products = result.docs.map((doc) => {
        const data = doc.data()
        return { ...data, id: doc.id }
      })
      setProductSearchResult(products)
      setShowProductSearchResult(products.length > 0)
    } else {
      setShowProductSearchResult(false)
      setProductSearchResult([])
    }
  }

  const productSelectHandler = (product: any) => {
    setShowProductSearchResult(false)
    setProductSearchResult([])
    setProduct(product)
    setProductSearchText(product.name)
    getCommunityProductSubscriptionPlans(community.id, shop.id, product.id)
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

  const getCommunityProductSubscriptionPlans = async (
    communityId: string,
    shopId?: string,
    productId?: string
  ) => {
    if (!communityId) return
    setLoading(true)
    const filter: any = { community_id: communityId, limit }
    if (shopId) filter.shop_id = shopId
    if (productId) filter.product_id = productId
    const dataRef = getProductSubscriptionPlans(filter)
    if (productSubscriptionPlansSnapshot && productSubscriptionPlansSnapshot.unsubscribe)
      productSubscriptionPlansSnapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = dataRef.onSnapshot(async (snapshot) => {
      setupDataList(snapshot.docs)
    })
    setProductSubscriptionPlansSnapshot({ unsubscribe: newUnsubscribe })
    setDataRef(dataRef)
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

  const onViewSubscriptions = (subscriptionPlan: any) => {
    setShowSubscriptions(true)
    setActiveSubscriptionPlan(subscriptionPlan)
  }

  const onCloseViewSubscriptions = () => {
    setShowSubscriptions(false)
    setActiveSubscriptionPlan(undefined)
  }

  return (
    <>
      <ProductSubscriptions
        subscriptionPlan={activeSubscriptionPlan}
        show={showSubscriptions}
        onClose={onCloseViewSubscriptions}
      />
      <h2 className="text-2xl font-semibold leading-tight">Product Subscription Plans</h2>
      <div className="flex items-center my-5 w-full">
        {community && community.id ? (
          <>
            <div ref={shopSearchResultRef} className="relative ml-2">
              <TextField
                label="Shop"
                type="text"
                size="small"
                placeholder="Search"
                onChange={shopSearchHandler}
                value={shopSearchText}
                onFocus={() => setShowShopSearchResult(shopSearchResult.length > 0)}
                noMargin
              />
              {showShopSearchResult && shopSearchResult.length > 0 && (
                <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
                  {shopSearchResult.map((shop: any) => (
                    <button
                      className="w-full p-1 hover:bg-gray-200 block text-left"
                      key={shop.id}
                      onClick={() => shopSelectHandler(shop)}
                    >
                      {shop.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div ref={productSearchResultRef} className="relative ml-2">
              <TextField
                label="Product"
                type="text"
                size="small"
                placeholder="Search"
                onChange={productSearchHandler}
                value={productSearchText}
                onFocus={() => setShowProductSearchResult(productSearchResult.length > 0)}
                noMargin
              />
              {showProductSearchResult && productSearchResult.length > 0 && (
                <div className="absolute top-full left-0 w-72 bg-white shadow z-10">
                  {productSearchResult.map((product: any) => (
                    <button
                      className="w-full p-1 hover:bg-gray-200 block text-left"
                      key={product.id}
                      onClick={() => productSelectHandler(product)}
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          ''
        )}
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
        ) : !community ? (
          <h2 className="text-xl ml-5">Select a community first</h2>
        ) : (
          <div className="h-full w-full overflow-y-auto mb-10">
            {productSubscriptionPlans.map((subscriptionPlan) => (
              <ProductSubscriptionPlanDetails
                subscriptionPlan={subscriptionPlan}
                onViewSubscriptions={() => onViewSubscriptions(subscriptionPlan)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default ProductSubscriptionPlansPage

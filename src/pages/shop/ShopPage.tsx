import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
import { fetchUserByID } from '../../services/users'
import MenuList from '../../components/MenuList'
import { LimitType, MenuItemType } from '../../utils/types'
import { getLimitedProductsByShop } from '../../services/products'
import Dropdown from '../../components/Dropdown'
import { Button } from '../../components/buttons'
import { fetchShopByID } from '../../services/shops'
import { fetchCommunityByID } from '../../services/community'
import { getOrdersByShop } from '../../services/orders'
import { getProductSubscriptionPlansByShop } from '../../services/productSubscriptionPlans'
import { getLikesByShop } from '../../services/likes'

type Props = {
  [x: string]: any
}

type DataType = 'likes' | 'orders' | 'products' | 'product_subscription_plans'

const ShopPage = ({ match }: Props) => {
  const [shop, setShop] = useState<any>({})
  const [dataToShow, setDataToShow] = useState<DataType>('products')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)

  const [dataRef, setDataRef] = useState<any>()
  const [firstDataOnList, setFirstDataOnList] = useState<any>()
  const [lastDataOnList, setLastDataOnList] = useState<any>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [snapshot, setSnapshot] = useState<{ unsubscribe: () => void }>()

  const items: MenuItemType[] = [
    {
      key: 'likes',
      name: 'Likes',
      onClick: () => onChangeDataToShow('likes'),
    },
    {
      key: 'orders',
      name: 'Orders Logs',
      onClick: () => onChangeDataToShow('orders'),
    },
    {
      key: 'products',
      name: 'Products',
      onClick: () => onChangeDataToShow('products'),
    },
    {
      key: 'product_subscription_plans',
      name: 'Subscription Plans',
      onClick: () => onChangeDataToShow('product_subscription_plans'),
    },
  ]

  const normalizeData = (data: any) => {
    const createdAt = dayjs(data.created_at.toDate()).format()
    const createdAtAgo = dayjs(createdAt).fromNow()
    return {
      id: data.id,
      status: data.status,
      operatingHours: data.operating_hours,
      coverPhoto: data.cover_photo,
      profilePhoto: data.profile_photo,
      name: data.name,
      createdAtAgo,
    }
  }

  const fetchShop = async (id: string) => {
    const shopRef = await fetchShopByID(id)
    let shopData = shopRef.data()
    if (shopData) {
      const community = await fetchCommunityByID(shopData.community_id)
      const communityData = community.data()
      if (communityData) {
        shopData.community_name = communityData.name
      }
      const user = await fetchUserByID(shopData.user_id)
      const userData = user.data()
      if (userData) {
        shopData.user_email = userData.email
      }
      shopData = { ...normalizeData(shopData), id }
      setShop(shopData)
    }
  }

  const fetchData = async (dataName: DataType) => {
    setLoading(true)
    const shopId = shop.id || match.params.id
    let newDataRef: any
    if (dataName === 'products') {
      newDataRef = getLimitedProductsByShop(shopId, limit)
    } else if (dataName === 'orders') {
      newDataRef = getOrdersByShop(shopId, limit)
    } else if (dataName === 'product_subscription_plans') {
      newDataRef = getProductSubscriptionPlansByShop(shopId, limit)
    } else if (dataName === 'likes') {
      newDataRef = getLikesByShop({ shopId, limit })
    }
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    const newUnsubscribe = newDataRef.onSnapshot(async (snapshot: any) => {
      setupDataList(snapshot.docs)
    })
    setSnapshot({ unsubscribe: newUnsubscribe })
    setDataRef(newDataRef)
    setPageNum(1)
    setIsLastPage(false)
  }

  const setupData = async () => {
    await fetchShop(match.params.id)
    await fetchData(dataToShow)
    setLoading(false)
  }

  const onChangeDataToShow = (dataName: DataType) => {
    setLoading(true)
    setDataToShow(dataName)
  }

  useEffect(() => {
    setupData()
  }, [match.params])

  useEffect(() => {
    if (shop.id) {
      fetchData(dataToShow)
    }
  }, [dataToShow, limit])

  const setupDataList = async (docs: any) => {
    let newData = docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
    if (dataToShow === 'orders' || dataToShow === 'product_subscription_plans') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const buyer = await fetchUserByID(data.buyer_id)
        const buyerData = buyer.data()
        if (buyerData) {
          data.buyer_email = buyerData.email
        }
      }
    }
    setData(newData)
    setLoading(false)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
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

  if (isEmpty(shop)) return null

  return (
    <div className="">
      <h2 className="text-2xl font-semibold leading-tight">{shop.name}</h2>
      <div className="flex">
        <div className="p-2 w-80">
          <img src={shop.profilePhoto} alt={shop.name} className="max-w-32 max-h-32" />
          <p>Created {shop.createdAtAgo}</p>
          <div className="py-2">
            <h4 className="text-xl font-semibold">Related Data</h4>
            <MenuList items={items} selected={dataToShow} />
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-xl font-semibold">
            {items.find((item) => item.key === dataToShow)!.name}
          </h3>
          <div className="flex align-middle mt-2">
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
          {loading ? (
            <div className="h-96 w-full relative">
              <ReactLoading
                type="spin"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                color="gray"
              />
            </div>
          ) : (
            <>
              {dataToShow === 'likes' && <h1>Likes data</h1>}
              {dataToShow === 'orders' && <h1>Orders data</h1>}
              {dataToShow === 'products' && <h1>Products data</h1>}
              {dataToShow === 'product_subscription_plans' && <h1>Subscription plans data</h1>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopPage

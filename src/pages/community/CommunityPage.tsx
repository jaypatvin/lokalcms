import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
import { fetchUserByID } from '../../services/users'
import MenuList from '../../components/MenuList'
import { LimitType, MenuItemType } from '../../utils/types'
import { getProductsByCommunity } from '../../services/products'
import Dropdown from '../../components/Dropdown'
import { Button } from '../../components/buttons'
import { fetchShopByID, getShopsByCommunity } from '../../services/shops'
import { getProductSubscriptionPlansByCommunity } from '../../services/productSubscriptionPlans'
import { getActivitiesByCommunity } from '../../services/activities'
import { getApplicationLogsByCommunity } from '../../services/applicationLogs'
import { getInvitesByCommunity } from '../../services/invites'
import { fetchCommunityByID } from '../../services/community'
import CommunityActivitiesTable from './CommunityActivitiesTable'
import CommunityApplicationLogsTable from './CommunityApplicationLogsTable'
import CommunityOrdersTable from './CommunityOrdersTable'
import CommunityProductsTable from './CommunityProductsTable'
import CommunityShopsTable from './CommunityShopsTable'
import CommunitySubscriptionPlansTable from './CommunitySubscriptionPlansTable'
import { getOrdersByCommunity } from '../../services/orders'
import CommunityInvitesTable from './CommunityInvitesTable'

type Props = {
  [x: string]: any
}

type DataType =
  | 'activities'
  | 'application_logs'
  | 'invites'
  | 'orders'
  | 'products'
  | 'shops'
  | 'product_subscription_plans'

const CommunityPage = ({ match }: Props) => {
  const [community, setCommunity] = useState<any>({})
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
      key: 'activities',
      name: 'Activities',
      onClick: () => onChangeDataToShow('activities'),
    },
    {
      key: 'application_logs',
      name: 'Application Logs',
      onClick: () => onChangeDataToShow('application_logs'),
    },
    {
      key: 'invites',
      name: 'Invites',
      onClick: () => onChangeDataToShow('invites'),
    },
    {
      key: 'orders',
      name: 'Orders',
      onClick: () => onChangeDataToShow('orders'),
    },
    {
      key: 'products',
      name: 'Products',
      onClick: () => onChangeDataToShow('products'),
    },
    {
      key: 'shops',
      name: 'Shops',
      onClick: () => onChangeDataToShow('shops'),
    },
    {
      key: 'product_subscription_plans',
      name: 'Subscription Plans',
      onClick: () => onChangeDataToShow('product_subscription_plans'),
    },
  ]

  const normalizeData = async (data: any) => {
    const createdAt = dayjs(data.created_at.toDate()).format()
    const createdAtAgo = dayjs(createdAt).fromNow()
    for (const userId of data.admin) {
      const admin = await fetchUserByID(userId)
      const adminData = admin.data()
      if (adminData) {
        if (!data.admins) data.admins = []
        data.admins.push(adminData.email)
      }
    }
    return {
      id: data.id,
      address: data.address,
      admins: data.admins,
      coverPhoto: data.cover_photo,
      profilePhoto: data.profile_photo,
      name: data.name,
      createdAtAgo,
    }
  }

  const fetchCommunity = async (id: string) => {
    const communityRef = await fetchCommunityByID(id)
    let communityData = { ...communityRef.data(), id: communityRef.id }
    if (communityData) {
      const normalizedData = await normalizeData(communityData)
      setCommunity(normalizedData)
    }
  }

  const fetchData = async (dataName: DataType) => {
    setLoading(true)
    const communityId = community.id || match.params.id
    let newDataRef: any
    if (dataName === 'products') {
      newDataRef = getProductsByCommunity(communityId, limit)
    } else if (dataName === 'shops') {
      newDataRef = getShopsByCommunity(communityId, limit)
    } else if (dataName === 'orders') {
      newDataRef = getOrdersByCommunity(communityId, limit)
    } else if (dataName === 'product_subscription_plans') {
      newDataRef = getProductSubscriptionPlansByCommunity(communityId, limit)
    } else if (dataName === 'activities') {
      newDataRef = getActivitiesByCommunity(communityId, limit)
    } else if (dataName === 'application_logs') {
      newDataRef = getApplicationLogsByCommunity(communityId, limit)
    } else if (dataName === 'invites') {
      newDataRef = getInvitesByCommunity(communityId, limit)
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
    await fetchCommunity(match.params.id)
    await fetchData(dataToShow)
    setLoading(false)
  }

  const onChangeDataToShow = (dataName: DataType) => {
    if (!loading) {
      setLoading(true)
      setDataToShow(dataName)
    }
  }

  useEffect(() => {
    setupData()
  }, [match.params])

  useEffect(() => {
    if (community.id) {
      fetchData(dataToShow)
    }
  }, [dataToShow, limit])

  const setupDataList = async (docs: any) => {
    let newData = docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
    if (dataToShow === 'products') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const shop = await fetchShopByID(data.shop_id)
        const shopData = shop.data()
        if (shopData) {
          data.shop_name = shopData.name
        }
        const user = await fetchUserByID(data.user_id)
        const userData = user.data()
        if (userData) {
          data.user_email = userData.email
        }
      }
    } else if (dataToShow === 'orders' || dataToShow === 'product_subscription_plans') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const buyer = await fetchUserByID(data.buyer_id)
        const buyerData = buyer.data()
        if (buyerData) {
          data.buyer_email = buyerData.email
        }
        const seller = await fetchUserByID(data.seller_id)
        const sellerData = seller.data()
        if (sellerData) {
          data.seller_email = sellerData.email
        }
      }
    } else if (
      dataToShow === 'activities' ||
      dataToShow === 'application_logs' ||
      dataToShow === 'shops'
    ) {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const user = await fetchUserByID(data.user_id)
        const userData = user.data()
        if (userData) {
          data.user_email = userData.email
        }
      }
    } else if (dataToShow === 'invites') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const user = await fetchUserByID(data.inviter)
        const userData = user.data()
        if (userData) {
          data.inviter_email = userData.email
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

  if (isEmpty(community)) return null

  return (
    <div className="">
      <h2 className="text-2xl font-semibold leading-tight">{community.name}</h2>
      <div className="flex">
        <div className="p-2 w-80">
          <img src={community.profilePhoto} alt={community.name} className="max-w-32 max-h-32" />
          <p className="text-gray-900">{`${community.address.subdivision}, ${community.address.barangay}, ${community.address.city}, ${community.address.state}, ${community.address.country}, ${community.address.zip_code}`}</p>
          <p>Created {community.createdAtAgo}</p>
          <p>Admins: {community.admins.join(', ')}</p>
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
              {dataToShow === 'activities' && <CommunityActivitiesTable data={data} />}
              {dataToShow === 'application_logs' && <CommunityApplicationLogsTable data={data} />}
              {dataToShow === 'invites' && <CommunityInvitesTable data={data} />}
              {dataToShow === 'orders' && <CommunityOrdersTable data={data} />}
              {dataToShow === 'products' && <CommunityProductsTable data={data} />}
              {dataToShow === 'shops' && <CommunityShopsTable data={data} />}
              {dataToShow === 'product_subscription_plans' && (
                <CommunitySubscriptionPlansTable data={data} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommunityPage

import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import { fetchUserByID } from '../../services/users'
import MenuList from '../../components/MenuList'
import { MenuItemType } from '../../utils/types'
import { fetchProductByID, getProductsByUser } from '../../services/products'
import Dropdown from '../../components/Dropdown'
import { Button } from '../../components/buttons'
import { fetchShopByID, getShopsByUser } from '../../services/shops'
import UserProductsTable from './UserProductsTable'
import UserShopsTable from './UserShopsTable'
import { getLikesByUser } from '../../services/likes'
import { getOrdersByBuyer, getOrdersBySeller } from '../../services/orders'
import {
  getProductSubscriptionPlansByBuyer,
  getProductSubscriptionPlansBySeller,
} from '../../services/productSubscriptionPlans'
import { getActivitiesByUser } from '../../services/activities'
import { getApplicationLogsByUser } from '../../services/applicationLogs'
import UserProductLikesTable from './UserProductLikesTable'
import UserShopLikesTable from './UserShopLikesTable'

type Props = {
  [x: string]: any
}

type DataType =
  | 'activities'
  | 'application_logs'
  | 'liked_activities'
  | 'liked_products'
  | 'liked_shops'
  | 'orders_buyer'
  | 'orders_seller'
  | 'products'
  | 'shops'
  | 'product_subscription_plans_buyer'
  | 'product_subscription_plans_seller'

const ProfilePage = ({ match }: Props) => {
  const [user, setUser] = useState<any>({})
  const [dataToShow, setDataToShow] = useState<DataType>('products')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      key: 'liked_activities',
      name: 'Liked Activities',
      onClick: () => onChangeDataToShow('liked_activities'),
    },
    {
      key: 'liked_products',
      name: 'Liked Products',
      onClick: () => onChangeDataToShow('liked_products'),
    },
    {
      key: 'liked_shops',
      name: 'Liked Shops',
      onClick: () => onChangeDataToShow('liked_shops'),
    },
    {
      key: 'orders_buyer',
      name: 'Orders as Buyer',
      onClick: () => onChangeDataToShow('orders_buyer'),
    },
    {
      key: 'orders_seller',
      name: 'Orders as Seller',
      onClick: () => onChangeDataToShow('orders_seller'),
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
      key: 'product_subscription_plans_buyer',
      name: 'Subscription Plans as Buyer',
      onClick: () => setDataToShow('product_subscription_plans_buyer'),
    },
    {
      key: 'product_subscription_plans_seller',
      name: 'Subscription Plans as Seller',
      onClick: () => setDataToShow('product_subscription_plans_seller'),
    },
  ]

  const normalizeUserData = (data: any) => {
    const createdAt = dayjs(data.created_at.toDate()).format()
    const createdAtAgo = dayjs(createdAt).fromNow()
    return {
      status: data.status,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      displayName: data.display_name,
      communityName: data.community_name,
      profilePhoto: data.profile_photo,
      street: data.address.street,
      isAdmin: data.roles.admin,
      createdAtAgo,
    }
  }

  const fetchUser = async (id: string) => {
    const userRef = await fetchUserByID(id)
    let userData = userRef.data()
    if (userData) {
      const community = await userData.community.get()
      const communityData = community.data()
      if (communityData) {
        userData.community_name = communityData.name
      }
      userData = { ...normalizeUserData(userData), id }
      setUser(userData)
    }
  }

  const fetchData = async (dataName: DataType) => {
    setLoading(true)
    const userId = user.id || match.params.id
    let newDataRef: any
    if (dataName === 'products') {
      newDataRef = await getProductsByUser(userId).get()
    } else if (dataName === 'shops') {
      newDataRef = await getShopsByUser(userId).get()
    } else if (dataName === 'liked_products') {
      newDataRef = await getLikesByUser({ userId, entityName: 'products' }).get()
    } else if (dataName === 'liked_shops') {
      newDataRef = await getLikesByUser({ userId, entityName: 'shops' }).get()
    } else if (dataName === 'liked_activities') {
      newDataRef = await getLikesByUser({ userId, entityName: 'activities' }).get()
    } else if (dataName === 'orders_buyer') {
      newDataRef = await getOrdersByBuyer(userId).get()
    } else if (dataName === 'orders_seller') {
      newDataRef = await getOrdersBySeller(userId).get()
    } else if (dataName === 'product_subscription_plans_buyer') {
      newDataRef = await getProductSubscriptionPlansByBuyer(userId).get()
    } else if (dataName === 'product_subscription_plans_seller') {
      newDataRef = await getProductSubscriptionPlansBySeller(userId).get()
    } else if (dataName === 'activities') {
      newDataRef = await getActivitiesByUser(userId).get()
    } else if (dataName === 'application_logs') {
      newDataRef = await getApplicationLogsByUser(userId).get()
    }
    let newData = newDataRef
      ? newDataRef.docs.map((doc: any) => ({ ...doc.data(), id: doc.id }))
      : []
    if (dataName === 'products') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const shop = await fetchShopByID(data.shop_id)
        const shopData = shop.data()
        if (shopData) {
          data.shop_name = shopData.name
        }
      }
    } else if (dataName === 'liked_products') {
      const extractedData = []
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const product = await fetchProductByID(data.product_id)
        const productData = product.data()
        if (productData) {
          const shop = await fetchShopByID(productData.shop_id)
          const shopData = shop.data()
          if (shopData) {
            productData.shop_name = shopData.name
          }
        }
        extractedData.push({ ...productData, liked_at: data.created_at })
      }
      newData = extractedData
    } else if (dataName === 'liked_shops') {
      const extractedData = []
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const shop = await fetchShopByID(data.shop_id)
        const shopData = shop.data()
        if (shopData) {
          extractedData.push({ ...shopData, liked_at: data.created_at })
        }
      }
      newData = extractedData
    }
    console.log('newData', newData)
    setData(newData)
    setLoading(false)
  }

  const setupData = async () => {
    await fetchUser(match.params.id)
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
    if (user.id) {
      fetchData(dataToShow)
    }
  }, [dataToShow])

  return (
    <div className="">
      <h2 className="text-2xl font-semibold leading-tight">{user.displayName}</h2>
      <div className="flex">
        <div className="p-2 w-80">
          <img src={user.profilePhoto} alt={user.displayName} className="max-w-32 max-h-32" />
          <p>{user.email}</p>
          <p>Member since {user.createdAtAgo}</p>
          <p>Community: {user.communityName}</p>
          <div className="py-2">
            <h4 className="text-xl font-semibold">Related Data</h4>
            <MenuList items={items} selected={dataToShow} />
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-xl font-semibold capitalize">{dataToShow}</h3>
          <div className="flex align-middle mt-2">
            <div className="flex items-center">
              Show:{' '}
              <Dropdown
                className="ml-1 z-10"
                simpleOptions={[10, 25, 50, 100]}
                size="small"
                currentValue={10}
              />
            </div>
            <Button className="ml-5" icon="arrowBack" size="small" color={'secondary'} />
            <Button className="ml-3" icon="arrowForward" size="small" color={'primary'} />
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
              {dataToShow === 'products' && <UserProductsTable data={data} />}
              {dataToShow === 'shops' && <UserShopsTable data={data} />}
              {dataToShow === 'liked_products' && <UserProductLikesTable data={data} />}
              {dataToShow === 'liked_shops' && <UserShopLikesTable data={data} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

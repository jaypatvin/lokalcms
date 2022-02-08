import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import { fetchUserByID } from '../../services/users'
import MenuList from '../../components/MenuList'
import { LimitType, MenuItemType } from '../../utils/types'
import { fetchProductByID, getProductsByUser } from '../../services/products'
import Dropdown from '../../components/Dropdown'
import { Button } from '../../components/buttons'
import { fetchShopByID, getShopsByUser } from '../../services/shops'
import UserProductsTable from './UserProductsTable'
import UserShopsTable from './UserShopsTable'
import { getLikesByUser } from '../../services/likes'
import { fetchOrderByID, getOrdersByBuyer, getOrdersBySeller } from '../../services/orders'
import {
  getProductSubscriptionPlansByBuyer,
  getProductSubscriptionPlansBySeller,
} from '../../services/productSubscriptionPlans'
import { fetchActivityByID, getActivitiesByUser } from '../../services/activities'
import { getApplicationLogsByUser } from '../../services/applicationLogs'
import UserProductLikesTable from './UserProductLikesTable'
import UserShopLikesTable from './UserShopLikesTable'
import UserActivitiesTable from './UserActivitiesTable'
import UserActivityLikesTable from './UserActivityLikesTable'
import UserApplicationLogsTable from './UserApplicationLogsTable'
import UserOrdersTable from './UserOrdersTable'
import UserSubscriptionPlansTable from './UserSubscriptionPlansTable'
import { getReviewsByUser } from '../../services/reviews'
import { getWishlistsByUser } from '../../services/wishlists'
import UserReviewsTable from './UserReviewsTable'
import VerifyUserModal from './VerifyUserModal'
import {
  Activity,
  ApplicationLog,
  Like,
  Order,
  Product,
  ProductSubscriptionPlan,
  Review,
  Shop,
  User,
  Wishlist,
} from '../../models'

type Props = {
  [x: string]: any
}

export type UserData = User & {
  id: string
  community_name?: string
}
export type ProductData = Product & { id: string; shop_name?: string }
export type ProductLikeData = ProductData & { liked_at: firebase.default.firestore.Timestamp }
export type ActivityData = Activity & { id: string; owner_email?: string }
export type ActivityLikeData = ActivityData & { liked_at: firebase.default.firestore.Timestamp }
export type ShopLikeData = Shop & { id: string; liked_at: firebase.default.firestore.Timestamp }
export type OrderData = Order & { id: string; buyer_email?: string; seller_email?: string }
export type ReviewData = Review & { id: string; product?: Product; shop?: Shop; order?: Order }
type DataRefType = firebase.default.firestore.Query<
  | Activity
  | ApplicationLog
  | Product
  | Shop
  | Order
  | Like
  | Review
  | Wishlist
  | ProductSubscriptionPlan
>
type DataDocType = firebase.default.firestore.QueryDocumentSnapshot<
  | Activity
  | ApplicationLog
  | Product
  | Shop
  | Order
  | Like
  | Review
  | Wishlist
  | ProductSubscriptionPlan
>

type DataType =
  | 'activities'
  | 'application_logs'
  | 'liked_activities'
  | 'liked_products'
  | 'liked_shops'
  | 'orders_buyer'
  | 'orders_seller'
  | 'products'
  | 'product_subscription_plans_buyer'
  | 'product_subscription_plans_seller'
  | 'reviews'
  | 'shops'
  | 'wishlist'

const ProfilePage = ({ match }: Props) => {
  const [user, setUser] = useState<UserData>()
  const [dataToShow, setDataToShow] = useState<DataType>('products')
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit] = useState<LimitType>(10)
  const [pageNum, setPageNum] = useState(1)

  const [dataRef, setDataRef] = useState<DataRefType>()
  const [firstDataOnList, setFirstDataOnList] = useState<DataDocType>()
  const [lastDataOnList, setLastDataOnList] = useState<DataDocType>()
  const [isLastPage, setIsLastPage] = useState(false)
  const [snapshot, setSnapshot] = useState<{ unsubscribe: () => void }>()

  const [showVerifyUser, setShowVerifyUser] = useState(false)

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
      onClick: () => onChangeDataToShow('product_subscription_plans_buyer'),
    },
    {
      key: 'product_subscription_plans_seller',
      name: 'Subscription Plans as Seller',
      onClick: () => onChangeDataToShow('product_subscription_plans_seller'),
    },
    {
      key: 'reviews',
      name: 'Reviews',
      onClick: () => onChangeDataToShow('reviews'),
    },
    {
      key: 'wishlist',
      name: 'Wishlist',
      onClick: () => onChangeDataToShow('wishlist'),
    },
  ]

  const fetchUser = async (id: string) => {
    const userRef = await fetchUserByID(id)
    const userRefData = userRef.data()
    if (userRefData) {
      const userData = { ...userRefData, id: userRef.id, community_name: '' }
      const community = await userData.community.get()
      const communityData = community.data()
      if (communityData) {
        userData.community_name = communityData.name
      }
      setUser(userData)
    }
  }

  const fetchData = async (dataName: DataType) => {
    setLoading(true)
    const userId = user?.id || match.params.id
    let newDataRef: DataRefType | undefined
    if (dataName === 'products') {
      newDataRef = getProductsByUser(userId, limit)
    } else if (dataName === 'shops') {
      newDataRef = getShopsByUser(userId, limit)
    } else if (dataName === 'liked_products') {
      newDataRef = getLikesByUser({ userId, entityName: 'products', limit })
    } else if (dataName === 'liked_shops') {
      newDataRef = getLikesByUser({ userId, entityName: 'shops', limit })
    } else if (dataName === 'liked_activities') {
      newDataRef = getLikesByUser({ userId, entityName: 'activities', limit })
    } else if (dataName === 'orders_buyer') {
      newDataRef = getOrdersByBuyer(userId, limit)
    } else if (dataName === 'orders_seller') {
      newDataRef = getOrdersBySeller(userId, limit)
    } else if (dataName === 'product_subscription_plans_buyer') {
      newDataRef = getProductSubscriptionPlansByBuyer(userId, limit)
    } else if (dataName === 'product_subscription_plans_seller') {
      newDataRef = getProductSubscriptionPlansBySeller(userId, limit)
    } else if (dataName === 'activities') {
      newDataRef = getActivitiesByUser(userId, limit)
    } else if (dataName === 'application_logs') {
      newDataRef = getApplicationLogsByUser(userId, limit)
    } else if (dataName === 'reviews') {
      newDataRef = getReviewsByUser({ userId, limit })
    } else if (dataName === 'wishlist') {
      newDataRef = getWishlistsByUser({ userId, limit })
    }
    if (snapshot && snapshot.unsubscribe) snapshot.unsubscribe() // unsubscribe current listener
    if (newDataRef) {
      const newUnsubscribe = newDataRef.onSnapshot(async (snapshot) => {
        setupDataList(snapshot.docs)
      })
      setSnapshot({ unsubscribe: newUnsubscribe })
      setDataRef(newDataRef)
      setPageNum(1)
      setIsLastPage(false)
    }
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
    if (user?.id) {
      fetchData(dataToShow)
    }
  }, [dataToShow, limit])

  const setupDataList = async (docs: DataDocType[]) => {
    let newData = docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }))
    if (dataToShow === 'products') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as ProductData
        const shop = await fetchShopByID(data.shop_id)
        const shopData = shop.data()
        if (shopData) {
          data.shop_name = shopData.name
        }
      }
    } else if (dataToShow === 'liked_products') {
      const extractedData: ProductLikeData[] = []
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as Like
        const product = await fetchProductByID(data.product_id!)
        const productData = product.data()
        if (productData) {
          const shop = await fetchShopByID(productData.shop_id)
          const shopData = shop.data()
          if (shopData) {
            extractedData.push({
              ...productData,
              shop_name: shopData.name,
              liked_at: data.created_at,
              id: data.product_id!,
            })
          }
        }
      }
      newData = extractedData
    } else if (dataToShow === 'liked_shops') {
      const extractedData: ShopLikeData[] = []
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as Like
        const shop = await fetchShopByID(data.shop_id!)
        const shopData = shop.data()
        if (shopData) {
          extractedData.push({ ...shopData, liked_at: data.created_at, id: data.shop_id! })
        }
      }
      newData = extractedData
    } else if (dataToShow === 'liked_activities') {
      const extractedData: ActivityLikeData[] = []
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as Like
        const activity = await fetchActivityByID(data.activity_id!)
        const activityData = activity.data()
        if (activityData) {
          const user = await fetchUserByID(activityData.user_id)
          const userData = user.data()
          extractedData.push({
            ...activityData,
            liked_at: data.created_at,
            owner_email: userData?.email ?? 'unknown',
            id: data.activity_id!,
          })
        }
      }
      newData = extractedData
    } else if (
      dataToShow === 'orders_seller' ||
      dataToShow === 'product_subscription_plans_seller'
    ) {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as OrderData
        const buyer = await fetchUserByID(data.buyer_id)
        const buyerData = buyer.data()
        if (buyerData) {
          data.buyer_email = buyerData.email
        }
      }
    } else if (dataToShow === 'orders_buyer' || dataToShow === 'product_subscription_plans_buyer') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as OrderData
        const seller = await fetchUserByID(data.seller_id)
        const sellerData = seller.data()
        if (sellerData) {
          data.seller_email = sellerData.email
        }
      }
    } else if (dataToShow === 'reviews') {
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as ReviewData
        const product = await fetchProductByID(data.product_id)
        const productData = product.data()
        if (productData) {
          data.product = productData
          const shop = await fetchShopByID(data.product.shop_id)
          const shopData = shop.data()
          if (shopData) {
            data.shop = shopData
            const order = await fetchOrderByID(data.order_id)
            const orderData = order.data()
            if (orderData) {
              data.order = orderData
            }
          }
        }
      }
    } else if (dataToShow === 'wishlist') {
      const extractedData: ProductData[] = []
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i] as Wishlist
        const product = await fetchProductByID(data.product_id)
        const productData = product.data()
        if (productData) {
          const shop = await fetchShopByID(data.shop_id)
          const shopData = shop.data()
          if (shopData) {
            extractedData.push({
              ...productData,
              shop_name: shopData.name,
              created_at: data.created_at,
              id: data.product_id,
            })
          }
        }
      }
      newData = extractedData
    }
    setData(newData)
    setLoading(false)
    setLastDataOnList(docs[docs.length - 1])
    setFirstDataOnList(docs[0])
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

  if (!user) return null

  return (
    <div className="">
      <VerifyUserModal
        user={user}
        show={showVerifyUser}
        onClose={() => setShowVerifyUser(false)}
        setUser={setUser}
      />
      <h2 className="text-2xl font-semibold leading-tight">{user.display_name}</h2>
      <div className="flex">
        <div className="p-2 w-80">
          <img src={user.profile_photo} alt={user.display_name} className="max-w-32 max-h-32" />
          <p>{user.email}</p>
          <p>Member since {dayjs(user.created_at.toDate()).fromNow()}</p>
          <p>Community: {user.community_name}</p>
          <p>
            {user.registration.verified ? (
              <span className="text-primary-400 font-bold">Verified</span>
            ) : (
              <span className="text-secondary-500 font-bold">Unverified</span>
            )}
            <button
              className="text-primary-400 underline ml-1"
              onClick={() => setShowVerifyUser(true)}
            >
              Edit
            </button>
          </p>
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
                onSelect={(option) => setLimit(option.value as LimitType)}
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
              {dataToShow === 'products' && <UserProductsTable data={data} />}
              {dataToShow === 'liked_products' && <UserProductLikesTable data={data} />}
              {dataToShow === 'shops' && <UserShopsTable data={data} />}
              {dataToShow === 'liked_shops' && <UserShopLikesTable data={data} />}
              {dataToShow === 'liked_activities' && <UserActivityLikesTable data={data} />}
              {dataToShow === 'activities' && <UserActivitiesTable data={data} />}
              {dataToShow === 'application_logs' && <UserApplicationLogsTable data={data} />}
              {dataToShow === 'orders_seller' && (
                <UserOrdersTable data={data} userType={'seller'} />
              )}
              {dataToShow === 'orders_buyer' && <UserOrdersTable data={data} userType={'buyer'} />}
              {dataToShow === 'product_subscription_plans_seller' && (
                <UserSubscriptionPlansTable data={data} userType={'seller'} />
              )}
              {dataToShow === 'product_subscription_plans_buyer' && (
                <UserSubscriptionPlansTable data={data} userType={'buyer'} />
              )}
              {dataToShow === 'wishlist' && <UserProductsTable data={data} isWishlist={true} />}
              {dataToShow === 'reviews' && <UserReviewsTable data={data} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

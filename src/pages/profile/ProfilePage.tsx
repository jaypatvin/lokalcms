import React, { useEffect, useState } from 'react'
import ReactLoading from 'react-loading'
import dayjs from 'dayjs'
import { fetchUserByID } from '../../services/users'
import MenuList from '../../components/MenuList'
import { MenuItemType } from '../../utils/types'
import { getProductsByUser } from '../../services/products'
import Dropdown from '../../components/Dropdown'
import { Button } from '../../components/buttons'
import { fetchShopByID, getShopsByUser } from '../../services/shops'
import UserProductsTable from './UserProductsTable'
import UserShopsTable from './UserShopsTable'

type Props = {
  [x: string]: any
}

type DataType =
  | 'activities'
  | 'history'
  | 'likes'
  | 'orders'
  | 'products'
  | 'shops'
  | 'subscriptions'

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
      key: 'history',
      name: 'History',
      onClick: () => onChangeDataToShow('history'),
    },
    {
      key: 'likes',
      name: 'Likes',
      onClick: () => onChangeDataToShow('likes'),
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
      key: 'subscriptions',
      name: 'Subscriptions',
      onClick: () => setDataToShow('subscriptions'),
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

  const fetchData = async (dataName: string) => {
    setLoading(true)
    let newData: any = []
    if (dataName === 'products') {
      const newDataRef = await getProductsByUser(user.id || match.params.id).get()
      newData = newDataRef.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      for (let i = 0; i < newData.length; i++) {
        const data = newData[i]
        const shop = await fetchShopByID(data.shop_id)
        const shopData = shop.data()
        if (shopData) {
          data.shop_name = shopData.name
        }
      }
    } else if (dataName === 'shops') {
      const newDataRef = await getShopsByUser(user.id || match.params.id).get()
      newData = newDataRef.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    }
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { fetchUserByID } from '../../services/users'
import MenuList from '../../components/MenuList'
import { MenuItemType } from '../../utils/types'
import { getProductsByUser } from '../../services/products'
import Dropdown from '../../components/Dropdown'
import { Button } from '../../components/buttons'
import SortButton from '../../components/buttons/SortButton'
import { fetchShopByID } from '../../services/shops'

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

  const items: MenuItemType[] = [
    {
      key: 'activities',
      name: 'Activities',
      onClick: () => setDataToShow('activities'),
    },
    {
      key: 'history',
      name: 'History',
      onClick: () => setDataToShow('history'),
    },
    {
      key: 'likes',
      name: 'Likes',
      onClick: () => setDataToShow('likes'),
    },
    {
      key: 'orders',
      name: 'Orders',
      onClick: () => setDataToShow('orders'),
    },
    {
      key: 'products',
      name: 'Products',
      onClick: () => setDataToShow('products'),
    },
    {
      key: 'shops',
      name: 'Shops',
      onClick: () => setDataToShow('shops'),
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
    }
    console.log('newData', newData)
    setData(newData)
  }

  const setupData = async () => {
    await fetchUser(match.params.id)
    await fetchData(dataToShow)
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
          <div className="p-2">
            <MenuList items={items} selected={dataToShow} />
          </div>
        </div>
        <div className="w-full">
          <h3 className="text-2xl font-semibold leading-tight">{dataToShow}</h3>
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
          <div className="table-wrapper w-full overflow-x-auto">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th key="photo">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Photo"
                        showSortIcons={false}
                      />
                    </th>
                    <th key="name">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Name"
                        showSortIcons={false}
                      />
                    </th>
                    <th key="shop">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Shop"
                        showSortIcons={false}
                      />
                    </th>
                    <th key="price">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Price"
                        showSortIcons={false}
                      />
                    </th>
                    <th key="quantity">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Quantity"
                        showSortIcons={false}
                      />
                    </th>
                    <th key="status">
                      <SortButton
                        className="text-xs uppercase font-bold"
                        label="Status"
                        showSortIcons={false}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d: any) => (
                    <tr>
                      <td>
                        <img src={d.gallery[0].url} alt={d.name} className="max-w-16 max-h-16" />
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{d.name}</p>
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{d.shop_name}</p>
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{d.base_price}</p>
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{d.quantity}</p>
                      </td>
                      <td>
                        <p className="text-gray-900 whitespace-no-wrap">{d.status}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

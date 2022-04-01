import React, { useEffect, useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getUsers } from '../../services/users'
import { GenericGetArgType, SortOrderType, UserFilterType, UserSortByType } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { DocumentType, User } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import { Column, ContextMenu } from '../../components/DynamicTable/types'

type UserData = User & {
  id: string
}

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Email',
    key: 'email',
  },
  {
    type: 'image',
    title: 'Profile photo',
    key: 'profile_photo',
  },
  {
    type: 'string',
    title: 'First name',
    key: 'first_name',
  },
  {
    type: 'string',
    title: 'Last name',
    key: 'last_name',
  },
  {
    type: 'string',
    title: 'Display name',
    key: 'display_name',
  },
  {
    type: 'reference',
    title: 'Community',
    key: 'community_id',
    collection: 'community',
    referenceField: 'name',
  },
  {
    type: 'string',
    title: 'Birthdate',
    key: 'birthdate',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
  },
  {
    type: 'number',
    title: 'Activity likes',
    key: '_meta.activities_likes_count',
  },
  {
    type: 'number',
    title: 'Orders as buyer',
    key: '_meta.orders_as_buyer_count',
  },
  {
    type: 'number',
    title: 'Orders as seller',
    key: '_meta.orders_as_seller_count',
  },
  {
    type: 'number',
    title: 'Subscription plans as buyer',
    key: '_meta.product_subscription_plans_as_buyer_count',
  },
  {
    type: 'number',
    title: 'Subscription plans as seller',
    key: '_meta.product_subscription_plans_as_seller_count',
  },
  {
    type: 'number',
    title: 'Products',
    key: '_meta.products_count',
  },
  {
    type: 'number',
    title: 'Product likes',
    key: '_meta.products_likes_count',
  },
  {
    type: 'number',
    title: 'Reviews',
    key: '_meta.reviews_count',
  },
  {
    type: 'number',
    title: 'Shops',
    key: '_meta.shops_count',
  },
  {
    type: 'number',
    title: 'Shop likes',
    key: '_meta.shops_likes_count',
  },
  {
    type: 'number',
    title: 'Wishlists',
    key: '_meta.wishlists_count',
  },
  {
    type: 'boolean',
    title: 'Archived',
    key: 'archived',
  },
  {
    type: 'datepast',
    title: 'Created',
    key: 'created_at',
  },
  {
    type: 'datepast',
    title: 'Updated',
    key: 'updated_at',
  },
]

const columns = ['email', 'display_name', 'community_id', 'created_at', 'updated_at']

const UserListPage = () => {
  const [users, setUsers] = useState<UserData[]>([])

  useEffect(() => {
    getUsers({ limit: 10 })
      .get()
      .then((snapshot) => snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      .then(setUsers)
  }, [])
  // const { firebaseToken } = useAuth()
  // const [filter, setFilter] = useState<UserFilterType>('all')
  // const [sortBy, setSortBy] = useState<UserSortByType>('display_name')
  // const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  // const menuOptions = [
  //   {
  //     key: 'all',
  //     name: 'All Users',
  //   },
  //   {
  //     key: 'archived',
  //     name: 'Archived Users',
  //   },
  //   {
  //     key: 'admin',
  //     name: 'Admins',
  //   },
  //   {
  //     key: 'member',
  //     name: 'Members',
  //   },
  //   {
  //     key: 'unregistered',
  //     name: 'Unregistered',
  //   },
  // ]
  // const columns = [
  //   {
  //     label: 'User',
  //     fieldName: 'display_name',
  //     sortable: true,
  //   },
  //   {
  //     label: 'Community',
  //     fieldName: 'community_id',
  //     sortable: false,
  //   },
  //   {
  //     label: 'Status',
  //     fieldName: 'status',
  //     sortable: false,
  //   },
  //   {
  //     label: 'Member Since',
  //     fieldName: 'created_at',
  //     sortable: true,
  //   },
  //   {
  //     label: 'Updated',
  //     fieldName: 'updated_at',
  //     sortable: true,
  //   },
  // ]
  // const setupDataList = async (docs: firebase.default.firestore.QueryDocumentSnapshot<User>[]) => {
  //   const newList: UserData[] = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  //   for (let i = 0; i < newList.length; i++) {
  //     const user = newList[i]
  //     const community = await user.community.get()
  //     const communityData = community.data()
  //     if (communityData) {
  //       user.community_name = communityData.name
  //     }
  //   }
  //   return newList
  // }
  // const normalizeData = (data: User & { id: string }) => {
  //   return {
  //     id: data.id,
  //     status: data.status,
  //     email: data.email,
  //     first_name: data.first_name,
  //     last_name: data.last_name,
  //     display_name: data.display_name,
  //     community_id: data.community_id,
  //     profile_photo: data.profile_photo,
  //     street: data.address.street,
  //     is_admin: data.roles.admin,
  //   }
  // }

  // const onArchive = async (user: DocumentType) => {
  //   let res
  //   if (API_URL && firebaseToken) {
  //     const { id } = user
  //     let url = `${API_URL}/users/${id}`
  //     res = await fetch(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${firebaseToken}`,
  //       },
  //       method: 'DELETE',
  //     })
  //     res = await res.json()
  //   } else {
  //     console.error('environment variable for the api does not exist.')
  //   }
  //   return res
  // }

  // const onUnarchive = async (user: DocumentType) => {
  //   let res
  //   if (API_URL && firebaseToken) {
  //     let url = `${API_URL}/users/${user.id}/unarchive`
  //     res = await fetch(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${firebaseToken}`,
  //       },
  //       method: 'PUT',
  //     })
  //     res = await res.json()
  //     console.log('res', res)
  //   } else {
  //     console.error('environment variable for the api does not exist.')
  //   }
  //   return res
  // }

  // const getData = ({ search, limit, community }: GenericGetArgType) => {
  //   return getUsers({ filter, sortBy, sortOrder, search, limit, community })
  // }

  const contextMenu: ContextMenu = [
    {
      title: 'Edit',
      onClick: (data) => {
        console.log('editing data', data)
      },
    },
    {
      title: 'Delete',
      onClick: (data) => {
        console.log('deleting data', data)
      },
    },
  ]

  return (
    <DynamicTable
      allColumns={allColumns}
      columnKeys={columns}
      data={users}
      contextMenu={contextMenu}
    />
  )

  // return (
  //   <ListPage
  //     name="users"
  //     menuName="Users"
  //     filterMenuOptions={menuOptions}
  //     createLabel="New User"
  //     columns={columns}
  //     filter={filter}
  //     onChangeFilter={setFilter}
  //     sortBy={sortBy}
  //     onChangeSortBy={setSortBy}
  //     sortOrder={sortOrder}
  //     onChangeSortOrder={setSortOrder}
  //     getData={getData}
  //     setupDataList={setupDataList}
  //     normalizeDataToUpdate={normalizeData}
  //     onArchive={onArchive}
  //     onUnarchive={onUnarchive}
  //   />
  // )
}

export default UserListPage

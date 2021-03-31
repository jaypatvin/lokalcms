import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { CategoryFilterType, CategorySortByType, SortOrderType } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { communityHaveMembers, getCommunities, getCommunityMeta } from '../../services/community'
import { fetchUserByID } from '../../services/users'

const CommunityListPage = (props: any) => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<CategoryFilterType>('all')
  const [sortBy, setSortBy] = useState<CategorySortByType>('name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const menuOptions = [
    {
      key: 'all',
      name: 'All',
    },
    {
      key: 'archived',
      name: 'Archived',
    },
  ]
  const columns = [
    {
      label: 'Name',
      fieldName: 'name',
      sortable: true,
    },
    {
      label: 'Address',
      fieldName: 'subdivision',
      sortable: true,
    },
    {
      label: 'Admins',
      fieldName: 'admin',
      sortable: false,
    },
    {
      label: '# of users',
      fieldName: 'users',
      sortable: false,
    },
    {
      label: '# of shops',
      fieldName: 'shops',
      sortable: false,
    },
    {
      label: '# of products',
      fieldName: 'products',
      sortable: false,
    },
    {
      label: 'Created At',
      fieldName: 'created_at',
      sortable: true,
    },
    {
      label: 'Updated At',
      fieldName: 'updated_at',
      sortable: true,
    },
  ]
  const setupDataList = async (
    docs: firebase.default.firestore.QueryDocumentSnapshot<firebase.default.firestore.DocumentData>[]
  ) => {
    const newList = docs.map((doc): any => ({ id: doc.id, ...doc.data() }))
    for (let i = 0; i < newList.length; i++) {
      const data = newList[i]
      data.haveMembers = await communityHaveMembers(data.id)
      data.meta = await getCommunityMeta(data.id)
      const admins = []
      if (data.admin && data.admin.length) {
        for (let i = 0; i < data.admin.length; i++) {
          const adminId = data.admin[i]
          const admin = await fetchUserByID(adminId)
          const adminData = admin.data()
          if (adminData) admins.push(adminData)
        }
      }
      data.admins = admins
    }
    return newList
  }
  const normalizeData = (data: firebase.default.firestore.DocumentData) => {
    return {
      id: data.id,
      name: data.name,
      cover_photo: data.cover_photo,
      profile_photo: data.profile_photo,
      admin: data.admin,
      ...data.address,
    }
  }

  const onArchive = async (data: any) => {
    let res: any
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/community/${id}`
      res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'DELETE',
      })
      res = await res.json()
    } else {
      console.error('environment variable for the api does not exist.')
    }
    return res
  }

  const onUnarchive = async (data: any) => {
    let res: any
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/community/${data.id}/unarchive`
      res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'PUT',
      })
      res = await res.json()
      console.log('res', res)
    } else {
      console.error('environment variable for the api does not exist.')
    }
    return res
  }
  return (
    <ListPage
      name="communities"
      menuName="Communities"
      filterMenuOptions={menuOptions}
      createLabel="New Community"
      columns={columns}
      filter={filter}
      onChangeFilter={setFilter}
      sortBy={sortBy}
      onChangeSortBy={setSortBy}
      sortOrder={sortOrder}
      onChangeSortOrder={setSortOrder}
      getData={getCommunities}
      setupDataList={setupDataList}
      normalizeDataToUpdate={normalizeData}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
    />
  )
}

export default CommunityListPage

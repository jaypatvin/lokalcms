import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import {
  CommunityFilterType,
  CommunitySortByType,
  GenericGetArgType,
  SortOrderType,
} from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { communityHaveMembers, getCommunities } from '../../services/community'
import { fetchUserByID } from '../../services/users'
import { Community, DocumentType, User } from '../../models'

const CommunityListPage = () => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<CommunityFilterType>('all')
  const [sortBy, setSortBy] = useState<CommunitySortByType>('name')
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
      fieldName: 'address.subdivision',
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
  const setupDataList = async (docs: FirebaseFirestore.QueryDocumentSnapshot<Community>[]) => {
    const newList = docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      haveMembers: false,
      admins: [] as User[],
    }))
    for (let i = 0; i < newList.length; i++) {
      const data = newList[i]
      data.haveMembers = await communityHaveMembers(data.id)
      if (data.admin && data.admin.length) {
        for (let i = 0; i < data.admin.length; i++) {
          const adminId = data.admin[i]
          const admin = await fetchUserByID(adminId)
          const adminData = admin.data()
          if (adminData) data.admins.push(adminData)
        }
      }
    }
    return newList
  }
  const normalizeData = (data: Community & { id: string }) => {
    return {
      id: data.id,
      name: data.name,
      cover_photo: data.cover_photo,
      profile_photo: data.profile_photo,
      admin: data.admin,
      ...data.address,
    }
  }

  const onArchive = async (data: DocumentType) => {
    let res
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

  const onUnarchive = async (data: DocumentType) => {
    let res
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

  const getData = ({ search, limit }: GenericGetArgType) =>
    getCommunities({ filter, sortBy, sortOrder, search, limit })

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
      getData={getData}
      setupDataList={setupDataList}
      normalizeDataToUpdate={normalizeData}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
    />
  )
}

export default CommunityListPage

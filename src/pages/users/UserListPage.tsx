import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getUsers } from '../../services/users'
import { GenericGetArgType, SortOrderType, UserFilterType, UserSortByType } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { DocumentType, User } from '../../models'

type UserData = User & {
  id: string
  community_name?: string
}

const UserListPage = () => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<UserFilterType>('all')
  const [sortBy, setSortBy] = useState<UserSortByType>('display_name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const menuOptions = [
    {
      key: 'all',
      name: 'All Users',
    },
    {
      key: 'archived',
      name: 'Archived Users',
    },
    {
      key: 'admin',
      name: 'Admins',
    },
    {
      key: 'member',
      name: 'Members',
    },
  ]
  const columns = [
    {
      label: 'User',
      fieldName: 'display_name',
      sortable: true,
    },
    {
      label: 'Community',
      fieldName: 'community_id',
      sortable: false,
    },
    {
      label: 'Status',
      fieldName: 'status',
      sortable: false,
    },
    {
      label: 'Member Since',
      fieldName: 'created_at',
      sortable: true,
    },
    {
      label: 'Updated',
      fieldName: 'updated_at',
      sortable: true,
    },
  ]
  const setupDataList = async (docs: FirebaseFirestore.QueryDocumentSnapshot<User>[]) => {
    const newList: UserData[] = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    for (let i = 0; i < newList.length; i++) {
      const user = newList[i]
      const community = await user.community.get()
      const communityData = community.data()
      if (communityData) {
        user.community_name = communityData.name
      }
    }
    return newList
  }
  const normalizeData = (data: User & { id: string }) => {
    return {
      id: data.id,
      status: data.status,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      display_name: data.display_name,
      community_id: data.community_id,
      profile_photo: data.profile_photo,
      street: data.address.street,
      is_admin: data.roles.admin,
    }
  }

  const onArchive = async (user: DocumentType) => {
    let res
    if (API_URL && firebaseToken) {
      const { id } = user
      let url = `${API_URL}/users/${id}`
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

  const onUnarchive = async (user: DocumentType) => {
    let res
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/users/${user.id}/unarchive`
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

  const getData = ({ search, limit, community }: GenericGetArgType) => {
    return getUsers({ filter, sortBy, sortOrder, search, limit, community })
  }

  return (
    <ListPage
      name="users"
      menuName="Users"
      filterMenuOptions={menuOptions}
      createLabel="New User"
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

export default UserListPage

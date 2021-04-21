import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getActivities } from '../../services/activities'
import { fetchCommunityByID } from '../../services/community'
import { fetchUserByID } from '../../services/users'
import {
  ActivityFilterType,
  ActivitySortByType,
  GenericGetArgType,
  SortOrderType,
} from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'

const ActivityListPage = (props: any) => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<ActivityFilterType>('all')
  const [sortBy, setSortBy] = useState<ActivitySortByType>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc')
  const menuOptions = [
    {
      key: 'all',
      name: 'All',
    },
    {
      key: 'enabled',
      name: 'Enabled',
    },
    {
      key: 'disabled',
      name: 'Disabled',
    },
    {
      key: 'archived',
      name: 'Archived',
    },
  ]
  const columns = [
    {
      label: 'User',
      fieldName: 'user_id',
      sortable: false,
    },
    {
      label: 'Community',
      fieldName: 'community_id',
      sortable: false,
    },
    {
      label: 'Message',
      fieldName: 'message',
      sortable: false,
    },
    {
      label: 'Status',
      fieldName: 'status',
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
      const activity = newList[i]
      const user = await fetchUserByID(activity.user_id)
      const userData = user.data()
      if (userData) {
        activity.user_email = userData.email
      }
      const community = await fetchCommunityByID(activity.community_id)
      const communityData = community.data()
      if (communityData) {
        activity.community_name = communityData.name
      }
    }
    return newList
  }
  const normalizeData = (activity: firebase.default.firestore.DocumentData) => {
    const data = {
      id: activity.id,
      message: activity.message,
      user_id: activity.user_id,
      status: activity.status,
    }
    return data
  }

  const onArchive = async (activity: any) => {
    let res: any
    if (API_URL && firebaseToken) {
      const { id } = activity
      let url = `${API_URL}/activities/${id}`
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

  const onUnarchive = async (activity: any) => {
    let res: any
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/activities/${activity.id}/unarchive`
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
    getActivities({ filter, sortBy, sortOrder, search, limit })

  return (
    <ListPage
      name="activities"
      menuName="Activities"
      filterMenuOptions={menuOptions}
      createLabel="New Activity"
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

export default ActivityListPage

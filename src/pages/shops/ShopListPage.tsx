import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getShops } from '../../services/shops'
import { GenericGetArgType, ShopFilterType, ShopSortByType, SortOrderType } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { fetchUserByID } from '../../services/users'

const ShopListPage = (props: any) => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<ShopFilterType>('all')
  const [sortBy, setSortBy] = useState<ShopSortByType>('name')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
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
      key: 'close',
      name: 'Close',
    },
    {
      key: 'open',
      name: 'Open',
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
      label: 'Description',
      fieldName: 'description',
      sortable: false,
    },
    {
      label: 'Owner',
      fieldName: 'user_id',
      sortable: false,
    },
    {
      label: 'Operating hours',
      fieldName: 'operating_hours',
      sortable: false,
    },
    {
      label: 'Is Close',
      fieldName: 'is_close',
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
      const data = newList[i]
      const user = await fetchUserByID(data.user_id)
      const userData = user.data()
      if (userData) {
        data.user_email = userData.email
      }
    }
    return newList
  }
  const normalizeData = (data: firebase.default.firestore.DocumentData) => {
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      is_close: data.is_close,
      status: data.status,
      opening: data.operating_hours.opening,
      closing: data.operating_hours.closing,
      use_custom_hours: data.operating_hours.custom,
      custom_hours: data.operating_hours,
    }
  }

  const onArchive = async (data: any) => {
    let res: any
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/shops/${id}`
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
      let url = `${API_URL}/shops/${data.id}/unarchive`
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
    getShops({ filter, sortBy, sortOrder, search, limit })

  return (
    <ListPage
      name="shops"
      menuName="Shops"
      filterMenuOptions={menuOptions}
      createLabel="New Shop"
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

export default ShopListPage

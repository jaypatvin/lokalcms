import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getShops } from '../../services/shops'
import {
  DaysType,
  GenericGetArgType,
  nthDayOfMonthFormat,
  ShopFilterType,
  ShopSortByType,
  SortOrderType,
} from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { fetchUserByID } from '../../services/users'
import { DocumentType, Shop } from '../../models'

type ShopData = Shop & {
  id: string
  user_email?: string
}

const days: DaysType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const ShopListPage = () => {
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
  const setupDataList = async (docs: firebase.default.firestore.QueryDocumentSnapshot<Shop>[]) => {
    const newList: ShopData[] = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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

  const constructOperatingHours = (data: Shop['operating_hours']) => {
    const { repeat_type, repeat_unit, start_time, end_time, start_dates, schedule } = data
    const unavailable_dates: string[] = []
    const custom_dates: string[] = []
    const days_open: DaysType[] = []
    if (schedule && schedule.custom) {
      Object.entries(schedule.custom).forEach(([key, val]) => {
        if (val.unavailable) {
          unavailable_dates.push(key)
        } else if (val.start_time || val.end_time) {
          custom_dates.push(key)
        }
      })
    }
    if (schedule) {
      Object.keys(schedule).forEach((key) => {
        if (days.includes(key as DaysType)) {
          days_open.push(key as DaysType)
        }
      })
    }
    const operatingHours = {
      start_time,
      end_time,
      start_dates: start_dates.map((d) => new Date(d)).sort(),
      repeat_unit,
      repeat_type: ['day', 'week', 'month'].includes(repeat_type) ? repeat_type : 'month',
      repeat_month_type: nthDayOfMonthFormat.test(repeat_type) ? 'sameDay' : 'sameDate',
      unavailable_dates: unavailable_dates.length ? unavailable_dates : null,
      custom_dates: custom_dates.length ? custom_dates : null,
      days_open: days_open.length ? days_open : null,
    }
    return operatingHours
  }

  const normalizeData = (data: Shop & { id: string }) => {
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      description: data.description,
      is_close: data.is_close,
      status: data.status,
      operating_hours: constructOperatingHours(data.operating_hours),
    }
  }

  const onArchive = async (data: DocumentType) => {
    let res
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

  const onUnarchive = async (data: DocumentType) => {
    let res
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

  const getData = ({ search, limit, community }: GenericGetArgType) => {
    return getShops({ filter, sortBy, sortOrder, search, limit, community })
  }

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

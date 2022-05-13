import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import { getShops, ShopFilterType, ShopSort, ShopsResponse } from '../../services/shops'
import { useAuth } from '../../contexts/AuthContext'
import { Shop } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  ContextMenu,
  FiltersMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import ShopCreateUpdateForm from './ShopCreateUpdateForm'
import { useCommunity } from '../../components/BasePage'
import { ConfirmationDialog } from '../../components/Dialog'
import { DaysType, nthDayOfMonthFormat } from '../../utils/types'

type ShopData = Shop & {
  id: string
}

const days: DaysType[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Name',
    key: 'name',
    referenceLink: '/shops/:id',
  },
  {
    type: 'image',
    title: 'Profile photo',
    key: 'profile_photo',
  },
  {
    type: 'reference',
    title: 'Owner',
    key: 'user_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'reference',
    title: 'Community',
    key: 'community_id',
    collection: 'community',
    referenceField: 'name',
  },
  {
    type: 'schedule',
    title: 'Operating Hours',
    key: 'operating_hours',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
  },
  {
    type: 'number',
    title: 'Likes',
    key: '_meta.likes_count',
  },
  {
    type: 'number',
    title: 'Orders',
    key: '_meta.orders_count',
  },
  {
    type: 'number',
    title: 'Subscriptions',
    key: '_meta.product_subscription_plans_count',
  },
  {
    type: 'number',
    title: 'Products',
    key: '_meta.products_count',
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

const columns = ['name', 'user_id', 'community_id', 'operating_hours', 'created_at', 'updated_at']

const filtersMenu: FiltersMenu = [
  {
    title: 'Status',
    id: 'status',
    options: [
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
    ],
  },
]

const sortMenu: SortMenu = [
  {
    title: 'Order',
    id: 'sortOrder',
    options: [
      {
        key: 'asc',
        name: 'Ascending',
      },
      {
        key: 'desc',
        name: 'Descending',
      },
    ],
  },
  {
    title: 'Column',
    id: 'sortBy',
    options: [
      {
        key: 'name',
        name: 'Name',
      },
      {
        key: 'created_at',
        name: 'Created at',
      },
    ],
  },
]

const initialFilter = {
  status: 'all',
  isClose: 'all',
  archived: false,
}

const initialSort = {
  sortOrder: 'asc',
  sortBy: 'name',
}

type FormData = {
  id: string
  user_id: string
  name: string
  description: string
  is_close: boolean
  status: string
  operating_hours: any
}

const ShopListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [data, setData] = useState<ShopsResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ShopFilterType,
    community: community?.id,
    sort: initialSort as ShopSort,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    if (firebaseToken) {
      setIsLoading(true)
      getShops(queryOptions, firebaseToken)
        .then((data) => setData(data))
        .finally(() => setIsLoading(false))
    }
  }, [queryOptions])

  useEffect(() => {
    setQueryOptions({ ...queryOptions, community: community.id })
  }, [community])

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

  const normalizeData = (data: ShopData) => {
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

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/shops/${id}`
      await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'DELETE',
      })
      setIsArchiveDialogOpen(false)
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const onUnarchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      let url = `${API_URL}/shops/${data.id}/unarchive`
      await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'PUT',
      })
      setIsUnarchiveDialogOpen(false)
    } else {
      console.error('environment variable for the api does not exist.')
    }
  }

  const contextMenu: ContextMenu = [
    {
      title: 'Edit',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ShopData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ShopData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as ShopData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ShopData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as ShopData).archived
      },
    },
  ]

  const onChangeFilter = (data: { [x: string]: unknown }) => {
    setQueryOptions({ ...queryOptions, filter: { ...queryOptions.filter, ...data } })
  }

  const onChangeTableConfig = (data: TableConfig) => {
    setQueryOptions({ ...queryOptions, ...data })
  }

  const onChangeSort = (data: { [x: string]: unknown }) => {
    setQueryOptions({ ...queryOptions, sort: { ...queryOptions.sort, ...data } })
  }

  return (
    <>
      <ShopCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <ShopCreateUpdateForm
        isOpen={isUpdateFormOpen}
        setIsOpen={setIsUpdateFormOpen}
        mode="update"
        dataToUpdate={dataToUpdate}
        isModal
      />
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onAccept={() => onArchive(dataToUpdate)}
        color="danger"
        title="Archive"
        descriptions={`Are you sure you want to archive ${dataToUpdate?.name}?`}
        acceptLabel="Archive"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => onUnarchive(dataToUpdate)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive ${dataToUpdate?.name}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      <DynamicTable
        name="Shop"
        data={data}
        loading={isLoading}
        allColumns={allColumns}
        columnKeys={columns}
        contextMenu={contextMenu}
        filtersMenu={filtersMenu}
        initialFilter={initialFilter}
        sortMenu={sortMenu}
        initialSort={initialSort}
        onChangeSort={onChangeSort}
        onChangeFilter={onChangeFilter}
        onChangeTableConfig={onChangeTableConfig}
        onClickCreate={() => setIsCreateFormOpen(true)}
      />
    </>
  )
}

export default ShopListPage

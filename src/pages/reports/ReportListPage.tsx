import React, { useEffect, useState } from 'react'
import { getReports, ReportFilterType, ReportSort, ReportsResponse } from '../../services/reports'
import { useAuth } from '../../contexts/AuthContext'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  FiltersMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import { useCommunity } from '../../components/BasePage'

const allColumns: Column[] = [
  {
    type: 'reference',
    title: 'Reporter',
    key: 'user_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'reference',
    title: 'Reported',
    key: 'reported_user_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'reference',
    title: 'Activity',
    key: 'activity_id',
    collection: 'activities',
    referenceField: 'activity_id',
  },
  {
    type: 'reference',
    title: 'Shop',
    key: 'shop_id',
    collection: 'shops',
    referenceField: 'name',
  },
  {
    type: 'reference',
    title: 'Product',
    key: 'product_id',
    referenceField: 'name',
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
    title: 'Description',
    key: 'description',
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

const columns = [
  'user_id',
  'reported_user_id',
  'community_id',
  'description',
  'created_at',
]

const filtersMenu: FiltersMenu = [
  {
    title: 'Type',
    id: 'reportType',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: 'activity',
        name: 'Activities',
      },
      {
        key: 'shop',
        name: 'Shops',
      },
      {
        key: 'product',
        name: 'Products',
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
        key: 'created_at',
        name: 'Created at',
      },
    ],
  },
]

const initialFilter = {
  reportType: 'all',
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

const ReportListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [data, setData] = useState<ReportsResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ReportFilterType,
    community: community?.id,
    sort: initialSort as ReportSort,
  })

  useEffect(() => {
    if (firebaseToken) {
      setIsLoading(true)
      getReports(queryOptions, firebaseToken)
        .then((data) => setData(data))
        .finally(() => setIsLoading(false))
    }
  }, [queryOptions])

  useEffect(() => {
    setQueryOptions({ ...queryOptions, community: community.id })
  }, [community])

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
      <DynamicTable
        name="Report"
        data={data}
        loading={isLoading}
        allColumns={allColumns}
        columnKeys={columns}
        filtersMenu={filtersMenu}
        initialFilter={initialFilter}
        sortMenu={sortMenu}
        initialSort={initialSort}
        onChangeSort={onChangeSort}
        onChangeFilter={onChangeFilter}
        onChangeTableConfig={onChangeTableConfig}
      />
    </>
  )
}

export default ReportListPage

import React, { useEffect, useState } from 'react'
import {
  getApplicationLogs,
  ApplicationLogFilterType,
  ApplicationLogSort,
} from '../../services/applicationLogs'
import { ApplicationLog } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import { Column, FiltersMenu, SortMenu, TableConfig } from '../../components/DynamicTable/types'
import { useCommunity } from '../../components/BasePage'

const allColumns: Column[] = [
  {
    type: 'reference',
    title: 'Owner',
    key: 'user_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'string',
    title: 'Action',
    key: 'action_type',
  },
  {
    type: 'string',
    title: 'Device id',
    key: 'device_id',
  },
  {
    type: 'boolean',
    title: 'Authenticated',
    key: 'is_authenticated',
  },
  {
    type: 'datepast',
    title: 'Created',
    key: 'created_at',
  },
]

const columns = ['user_id', 'action_type', 'device_id', 'is_authenticated', 'created_at']

const filtersMenu: FiltersMenu = [
  {
    title: 'Action type',
    id: 'actionType',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: 'product_view',
        name: 'Product view',
      },
      {
        key: 'user_login',
        name: 'User login',
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
  actionType: 'all',
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

const ApplicationLogListPage = () => {
  const community = useCommunity()
  const [dataRef, setDataRef] = useState<firebase.default.firestore.Query<ApplicationLog>>()
  const [queryOptions, setQueryOptions] = useState({
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ApplicationLogFilterType,
    communityId: community?.id,
    sort: initialSort as ApplicationLogSort,
  })

  useEffect(() => {
    if (!community || !community.id || !queryOptions.communityId) return
    setDataRef(getApplicationLogs(queryOptions))
  }, [queryOptions])

  useEffect(() => {
    setQueryOptions({ ...queryOptions, communityId: community.id })
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
      {!community?.id ? <h2 className="text-xl ml-5">Select a community first</h2> : ''}
      {dataRef && community?.id ? (
        <DynamicTable
          name="Application Log"
          dataRef={dataRef}
          allColumns={allColumns}
          columnKeys={columns}
          filtersMenu={filtersMenu}
          initialFilter={initialFilter}
          showSearch={false}
          sortMenu={sortMenu}
          initialSort={initialSort}
          onChangeSort={onChangeSort}
          onChangeFilter={onChangeFilter}
          onChangeTableConfig={onChangeTableConfig}
        />
      ) : (
        ''
      )}
    </>
  )
}

export default ApplicationLogListPage

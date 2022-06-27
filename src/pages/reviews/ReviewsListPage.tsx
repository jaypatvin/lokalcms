import React, { useEffect, useState } from 'react'
import { getReviews, ReviewFilterType, ReviewSort, ReviewsResponse } from '../../services/reviews'
import { useAuth } from '../../contexts/AuthContext'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import { Column, FiltersMenu, SortMenu, TableConfig } from '../../components/DynamicTable/types'
import { useCommunity } from '../../components/BasePage'

const allColumns: Column[] = [
  {
    type: 'reference',
    title: 'Reviewer',
    key: 'user_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'reference',
    title: 'Reviewed User',
    key: 'seller_id',
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
    type: 'string',
    title: 'Message',
    key: 'message',
  },
  {
    type: 'string',
    title: 'Rating',
    key: 'rating',
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
    collection: 'products',
    referenceField: 'name',
  },
  {
    type: 'reference',
    title: 'Order',
    key: 'order_id',
    collection: 'orders',
    referenceField: 'id',
  },
  {
    type: 'datepast',
    title: 'Created',
    key: 'created_at',
  },
]

const columns = ['user_id', 'seller_id', 'message', 'rating', 'shop_id', 'product_id', 'created_at']

const filtersMenu: FiltersMenu = [
  {
    title: 'Rating',
    id: 'rating',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: '5',
        name: '5',
      },
      {
        key: '4',
        name: '4',
      },
      {
        key: '3',
        name: '3',
      },
      {
        key: '2',
        name: '2',
      },
      {
        key: '1',
        name: '1',
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
        key: 'rating',
        name: 'Rating',
      },
      {
        key: 'created_at',
        name: 'Created at',
      },
    ],
  },
]

const initialFilter = {
  rating: 'all',
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

const ReviewListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [data, setData] = useState<ReviewsResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ReviewFilterType,
    community: community?.id,
    sort: initialSort as ReviewSort,
  })

  useEffect(() => {
    if (firebaseToken) {
      setIsLoading(true)
      getReviews(queryOptions, firebaseToken)
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
        name="Review"
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

export default ReviewListPage

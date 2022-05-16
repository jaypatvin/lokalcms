import React, { useEffect, useState } from 'react'
import { getOrders, OrderFilterType, OrderSort, OrdersResponse } from '../../services/orders'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import { Column, FiltersMenu, SortMenu, TableConfig } from '../../components/DynamicTable/types'
import { useCommunity } from '../../components/BasePage'
import { useAuth } from '../../contexts/AuthContext'

const allColumns: Column[] = [
  {
    type: 'reference',
    title: 'Buyer',
    key: 'buyer_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'reference',
    title: 'Seller',
    key: 'seller_id',
    collection: 'users',
    referenceField: 'email',
  },
  {
    type: 'reference',
    title: 'Shop',
    key: 'shop_id',
    collection: 'shops',
    referenceField: 'name',
  },
  {
    type: 'products',
    title: 'Products',
    key: 'products',
  },
  {
    type: 'datepast',
    title: 'Delivery date',
    key: 'delivery_date',
  },
  {
    type: 'string',
    title: 'Delivery option',
    key: 'delivery_option',
  },
  {
    type: 'string',
    title: 'Payment method',
    key: 'payment_method',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status_code',
  },
  {
    type: 'string',
    title: 'Street',
    key: 'delivery_address.street',
  },
  {
    type: 'boolean',
    title: 'Paid',
    key: 'is_paid',
  },
  {
    type: 'string',
    title: 'Instruction',
    key: 'instruction',
  },
  {
    type: 'string',
    title: 'Cancellation reason',
    key: 'cancellation_reason',
  },
  {
    type: 'string',
    title: 'Decline reason',
    key: 'decline_reason',
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
  'buyer_id',
  'seller_id',
  'shop_id',
  'products',
  'status_code',
  'created_at',
  'updated_at',
]

const filtersMenu: FiltersMenu = [
  {
    title: 'Status',
    id: 'statusCode',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: '10',
        name: 'Cancelled',
      },
      {
        key: '20',
        name: 'Declined',
      },
      {
        key: '100',
        name: 'Confirmed order',
      },
      {
        key: '200',
        name: 'Waiting for payment',
      },
      {
        key: '300',
        name: 'Confirming payment',
      },
      {
        key: '400',
        name: 'Waiting for delivery',
      },
      {
        key: '500',
        name: 'Shipped out',
      },
      {
        key: '600',
        name: 'Past order',
      },
    ],
  },
  {
    title: 'Delivery option',
    id: 'deliveryOption',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: 'delivery',
        name: 'Delivery',
      },
      {
        key: 'pickup',
        name: 'Pickup',
      },
    ],
  },
  {
    title: 'Payment method',
    id: 'paymentMethod',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: 'bank',
        name: 'Bank',
      },
      {
        key: 'cod',
        name: 'Cash on delivery',
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
  statusCode: 'all',
  isPaid: 'all',
  deliveryOption: 'all',
  paymentMethod: 'all',
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

const OrderListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [data, setData] = useState<OrdersResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as OrderFilterType,
    communityId: community?.id,
    sort: initialSort as OrderSort,
  })

  useEffect(() => {
    if (!community || !community.id || !queryOptions.communityId) return
    if (firebaseToken) {
      setIsLoading(true)
      getOrders(queryOptions, firebaseToken)
        .then((data) => setData(data))
        .finally(() => setIsLoading(false))
    }
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
      {community?.id ? (
        <DynamicTable
          name="Order"
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
      ) : (
        ''
      )}
    </>
  )
}

export default OrderListPage

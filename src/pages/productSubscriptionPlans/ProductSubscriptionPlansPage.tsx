import React, { useEffect, useState } from 'react'
import {
  getProductSubscriptionPlans,
  ProductSubscriptionPlanFilterType,
  ProductSubscriptionPlanSort,
} from '../../services/productSubscriptionPlans'
import { ProductSubscriptionPlan } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import { Column, FiltersMenu, SortMenu, TableConfig } from '../../components/DynamicTable/types'
import { useCommunity } from '../../components/BasePage'

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
    type: 'product',
    title: 'Product',
    key: 'product',
  },
  {
    type: 'number',
    title: 'Quantity',
    key: 'quantity',
  },
  {
    type: 'schedule',
    title: 'Plan',
    key: 'plan',
  },
  {
    type: 'string',
    title: 'Payment method',
    key: 'payment_method',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
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
  'product',
  'quantity',
  'plan',
  'created_at',
  'updated_at',
]

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
      {
        key: 'cancelled',
        name: 'Cancelled',
      },
      {
        key: 'unsubscribed',
        name: 'Unsubscribed',
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
  status: 'all',
  paymentMethod: 'all',
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

const ProductSubscriptionPlanListPage = () => {
  const community = useCommunity()
  const [dataRef, setDataRef] =
    useState<firebase.default.firestore.Query<ProductSubscriptionPlan>>()
  const [queryOptions, setQueryOptions] = useState({
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ProductSubscriptionPlanFilterType,
    communityId: community?.id,
    sort: initialSort as ProductSubscriptionPlanSort,
  })

  useEffect(() => {
    if (!community || !community.id || !queryOptions.communityId) return
    setDataRef(getProductSubscriptionPlans(queryOptions))
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
          name="Product Subscription Plan"
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

export default ProductSubscriptionPlanListPage

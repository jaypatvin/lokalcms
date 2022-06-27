import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import {
  getProducts,
  ProductFilterType,
  ProductSort,
  ProductsResponse,
} from '../../services/products'
import { useAuth } from '../../contexts/AuthContext'
import { Product } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  ContextMenu,
  FiltersMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import ProductCreateUpdateForm from './ProductCreateUpdateForm'
import { useCommunity } from '../../components/BasePage'
import { ConfirmationDialog } from '../../components/Dialog'

type ProductData = Product & {
  id: string
}

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Name',
    key: 'name',
  },
  {
    type: 'string',
    title: 'Description',
    key: 'description',
  },
  {
    type: 'gallery',
    title: 'Gallery',
    key: 'gallery',
  },
  {
    type: 'string',
    title: 'Category',
    key: 'product_category',
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
    title: 'Shop',
    key: 'shop_id',
    collection: 'shops',
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
    type: 'schedule',
    title: 'Availability',
    key: 'availability',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
  },
  {
    type: 'boolean',
    title: 'Subscription',
    key: 'can_subscribe',
  },
  {
    type: 'currency',
    title: 'Base price',
    key: 'base_price',
  },
  {
    type: 'number',
    title: 'Quantity',
    key: 'quantity',
  },
  {
    type: 'number',
    title: 'Rating',
    key: '_meta.average_rating',
  },
  {
    type: 'number',
    title: 'Likes',
    key: '_meta.likes_count',
  },
  {
    type: 'number',
    title: 'Reviews',
    key: '_meta.reviews_count',
  },
  {
    type: 'number',
    title: 'Reports',
    key: '_meta.reports_count',
  },
  {
    type: 'number',
    title: 'Wishlists',
    key: '_meta.wishlists_count',
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

const columns = [
  'name',
  'user_id',
  'gallery',
  'community_id',
  'shop_id',
  'availability',
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
        key: 'base_price',
        name: 'Price',
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
  shop_id: string
  name: string
  description: string
  base_price: number
  quantity: number
  status: string
  product_category: string
  gallery?: Product['gallery']
}

const ProductListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [data, setData] = useState<ProductsResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ProductFilterType,
    community: community?.id,
    sort: initialSort as ProductSort,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    if (firebaseToken) {
      setIsLoading(true)
      getProducts(queryOptions, firebaseToken)
        .then((data) => setData(data))
        .finally(() => setIsLoading(false))
    }
  }, [queryOptions])

  useEffect(() => {
    setQueryOptions({ ...queryOptions, community: community.id })
  }, [community])

  const normalizeData = (data: ProductData) => {
    return {
      id: data.id,
      shop_id: data.shop_id,
      name: data.name,
      description: data.description,
      base_price: data.base_price,
      quantity: data.quantity,
      status: data.status,
      product_category: data.product_category,
      gallery: data.gallery,
    }
  }

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/products/${id}`
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
      let url = `${API_URL}/products/${data.id}/unarchive`
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
        setDataToUpdate(normalizeData(data as ProductData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ProductData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as ProductData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ProductData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as ProductData).archived
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
      <ProductCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <ProductCreateUpdateForm
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
        name="Product"
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

export default ProductListPage

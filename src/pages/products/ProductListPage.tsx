import React, { useState } from 'react'
import { difference } from 'lodash'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getProducts } from '../../services/products'
import {
  GenericGetArgType,
  ProductFilterType,
  ProductSortByType,
  SortOrderType,
} from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { fetchUserByID } from '../../services/users'
import { fetchShopByID } from '../../services/shops'
import { DocumentType, Product, Shop } from '../../models'

type ProductData = Product & {
  id: string
  user_email?: string
  shop?: Shop
  shop_name?: string
}

const ProductListPage = () => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<ProductFilterType>('all')
  const [sortBy, setSortBy] = useState<ProductSortByType>('name')
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
      label: 'Shop',
      fieldName: 'shop_id',
      sortable: false,
    },
    {
      label: 'Availability',
      fieldName: 'availability',
      sortable: false,
    },
    {
      label: 'Price',
      fieldName: 'base_price',
      sortable: true,
    },
    {
      label: 'Quantity',
      fieldName: 'quantity',
      sortable: true,
    },
    {
      label: 'Category',
      fieldName: 'product_category',
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
  const setupDataList = async (docs: FirebaseFirestore.QueryDocumentSnapshot<Product>[]) => {
    const newList: ProductData[] = docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    for (let i = 0; i < newList.length; i++) {
      const data = newList[i]
      const user = await fetchUserByID(data.user_id)
      const userData = user.data()
      if (userData) {
        data.user_email = userData.email
      }
      const shop = await fetchShopByID(data.shop_id)
      const shopData = shop.data()
      if (shopData) {
        data.shop = shopData
        data.shop_name = shopData.name
      }
    }
    return newList
  }

  const getUnavailableDates = (data: Product['availability']) => {
    if (!data) return []
    const { schedule } = data
    const unavailable_dates: string[] = []
    if (schedule && schedule.custom) {
      Object.entries(schedule.custom).forEach(([key, val]) => {
        if (val.unavailable) {
          unavailable_dates.push(key)
        }
      })
    }
    return unavailable_dates
  }

  const isUsingShopSchedule = (data: ProductData) => {
    if (!data.availability || !data.shop || !data.shop.operating_hours) return true
    const productUnavailableDates = getUnavailableDates(data.availability)
    const shopUnavailableDates = getUnavailableDates(data.shop.operating_hours)
    if (difference(productUnavailableDates, shopUnavailableDates).length) return false
    return true
  }

  const normalizeData = (data: Product & { id: string }) => {
    const unavailable_dates = getUnavailableDates(data.availability)
    return {
      id: data.id,
      shop_id: data.shop_id,
      name: data.name,
      description: data.description,
      base_price: data.base_price,
      quantity: data.quantity,
      status: data.status,
      product_category: data.product_category,
      gallery: data.gallery ?? null,
      availability: data.availability,
      unavailable_dates: unavailable_dates,
      custom_availability: !isUsingShopSchedule(data),
    }
  }

  const onArchive = async (data: DocumentType) => {
    let res
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/products/${id}`
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
      let url = `${API_URL}/products/${data.id}/unarchive`
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
    return getProducts({ filter, sortBy, sortOrder, search, limit, community })
  }

  return (
    <ListPage
      name="products"
      menuName="Products"
      filterMenuOptions={menuOptions}
      createLabel="New Product"
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

export default ProductListPage

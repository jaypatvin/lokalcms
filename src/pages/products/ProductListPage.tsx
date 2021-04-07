import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import { getProducts } from '../../services/products'
import { ProductFilterType, ProductSortByType, SortOrderType } from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { fetchUserByID } from '../../services/users'
import { fetchShopByID } from '../../services/shops'

const ProductListPage = (props: any) => {
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
      sortable: true,
    },
    {
      label: 'Status',
      fieldName: 'status',
      sortable: true,
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
      const shop = await fetchShopByID(data.shop_id)
      const shopData = shop.data()
      if (shopData) {
        data.shop_name = shopData.name
      }
    }
    return newList
  }
  const normalizeData = (data: firebase.default.firestore.DocumentData) => {
    return {
      id: data.id,
      shop_id: data.shop_id,
      name: data.name,
      description: data.description,
      base_price: data.base_price,
      quantity: data.quantity,
      status: data.status,
      product_category: data.product_category,
      gallery: data.gallery ? data.gallery.map((photo: any) => ({ ...photo })) : null,
    }
  }

  const onArchive = async (data: any) => {
    let res: any
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

  const onUnarchive = async (data: any) => {
    let res: any
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
      getData={getProducts}
      setupDataList={setupDataList}
      normalizeDataToUpdate={normalizeData}
      onArchive={onArchive}
      onUnarchive={onUnarchive}
    />
  )
}

export default ProductListPage
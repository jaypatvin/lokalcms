import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import {
  CategoryFilterType,
  CategorySortByType,
  GenericGetArgType,
  SortOrderType,
} from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { getCategories } from '../../services/categories'
import { Category, DocumentType } from '../../models'

const CategoryListPage = () => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<CategoryFilterType>('all')
  const [sortBy, setSortBy] = useState<CategorySortByType>('name')
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
  const setupDataList = async (docs: FirebaseFirestore.QueryDocumentSnapshot<DocumentType>[]) => {
    return docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  }
  const normalizeData = (data: Category & { id: string }) => {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon_url: data.icon_url,
      cover_url: data.cover_url,
      status: data.status,
    }
  }

  const onArchive = async (data: DocumentType) => {
    let res
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/categories/${id}`
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
      let url = `${API_URL}/categories/${data.id}/unarchive`
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

  const getData = ({ search, limit }: GenericGetArgType) =>
    getCategories({ filter, sortBy, sortOrder, search, limit })

  return (
    <ListPage
      name="categories"
      menuName="Categories"
      filterMenuOptions={menuOptions}
      createLabel="New Category"
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

export default CategoryListPage

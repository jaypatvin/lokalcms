import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import { getCategories, CategoryFilterType, CategorySort } from '../../services/categories'
import { useAuth } from '../../contexts/AuthContext'
import { Category } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  ContextMenu,
  FiltersMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import CategoryCreateUpdateForm from './CategoryCreateUpdateForm'
import { useCommunity } from '../../components/BasePage'
import { ConfirmationDialog } from '../../components/Dialog'

type CategoryData = Category & {
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
    type: 'image',
    title: 'Icon',
    key: 'icon_url',
  },
  {
    type: 'image',
    title: 'Cover',
    key: 'cover_url',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
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

const columns = ['name', 'icon_url', 'created_at', 'updated_at']

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
      {
        key: 'updated_at',
        name: 'Updated at',
      },
    ],
  },
]

const initialFilter = {
  status: 'all',
  archived: false,
}

const initialSort = {
  sortOrder: 'asc',
  sortBy: 'name',
}

type FormData = {
  id: string
  name: string
  description: string
  icon_url: string
  cover_url: string
  status: string
}

const CategoryListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [dataRef, setDataRef] = useState<firebase.default.firestore.Query<Category>>()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as CategoryFilterType,
    community: community?.id,
    sort: initialSort as CategorySort,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    setDataRef(getCategories(queryOptions))
  }, [queryOptions])

  const normalizeData = (data: CategoryData) => {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      icon_url: data.icon_url,
      cover_url: data.cover_url,
      status: data.status,
    }
  }

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/categories/${id}`
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
      let url = `${API_URL}/categories/${data.id}/unarchive`
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
        setDataToUpdate(normalizeData(data as CategoryData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as CategoryData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as CategoryData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as CategoryData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as CategoryData).archived
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
      <CategoryCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <CategoryCreateUpdateForm
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
      {dataRef ? (
        <DynamicTable
          name="Category"
          dataRef={dataRef}
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
      ) : (
        ''
      )}
    </>
  )
}

export default CategoryListPage

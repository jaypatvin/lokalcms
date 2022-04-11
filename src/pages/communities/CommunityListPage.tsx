import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import { getCommunities, CommunitySort } from '../../services/community'
import { useAuth } from '../../contexts/AuthContext'
import { Community } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  ContextMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import CommunityCreateUpdateForm from './CommunityCreateUpdateForm'
import { ConfirmationDialog } from '../../components/Dialog'

type CommunityData = Community & {
  id: string
}

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Name',
    key: 'name',
    referenceLink: '/community/:id',
  },
  {
    type: 'image',
    title: 'Profile photo',
    key: 'profile_photo',
  },
  {
    type: 'image',
    title: 'Cover photo',
    key: 'cover_photo',
  },
  {
    type: 'number',
    title: 'Orders',
    key: '_meta.orders_count',
  },
  {
    type: 'number',
    title: 'Subscriptions',
    key: '_meta.product_subscription_plans_count',
  },
  {
    type: 'number',
    title: 'Products',
    key: '_meta.products_count',
  },
  {
    type: 'number',
    title: 'Shops',
    key: '_meta.shops_count',
  },
  {
    type: 'number',
    title: 'Users',
    key: '_meta.users_count',
  },
  {
    type: 'string',
    title: 'Subdivision',
    key: 'address.subdivision',
  },
  {
    type: 'string',
    title: 'Barangay',
    key: 'address.barangay',
  },
  {
    type: 'string',
    title: 'City',
    key: 'address.city',
  },
  {
    type: 'string',
    title: 'State',
    key: 'address.state',
  },
  {
    type: 'string',
    title: 'Country',
    key: 'address.country',
  },
  {
    type: 'string',
    title: 'Zip code',
    key: 'address.zip_code',
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
  'address.subdivision',
  'address.barangay',
  'address.city',
  'created_at',
  'updated_at',
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
        key: 'address.subdivision',
        name: 'Subdivision',
      },
      {
        key: 'address.barangay',
        name: 'Barangay',
      },
      {
        key: 'address.city',
        name: 'City',
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

const initialSort = {
  sortOrder: 'asc',
  sortBy: 'name',
}

type FormData = {
  id: string
  name: string
  cover_photo?: string
  profile_photo?: string
  admin?: string[]
  barangay: string
  city: string
  country: string
  state: string
  subdivision: string
  zip_code: string
}

const CommunityListPage = () => {
  const { firebaseToken } = useAuth()
  const [dataRef, setDataRef] = useState<firebase.default.firestore.Query<Community>>()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    sort: initialSort as CommunitySort,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    setDataRef(getCommunities(queryOptions))
  }, [queryOptions])

  const normalizeData = (data: CommunityData) => {
    return {
      id: data.id,
      name: data.name,
      cover_photo: data.cover_photo,
      profile_photo: data.profile_photo,
      admin: data.admin,
      ...data.address,
    }
  }

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/community/${id}`
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
      let url = `${API_URL}/community/${data.id}/unarchive`
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
        setDataToUpdate(normalizeData(data as CommunityData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as CommunityData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as CommunityData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as CommunityData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as CommunityData).archived
      },
    },
  ]

  const onChangeTableConfig = (data: TableConfig) => {
    setQueryOptions({ ...queryOptions, ...data })
  }

  const onChangeSort = (data: { [x: string]: unknown }) => {
    setQueryOptions({ ...queryOptions, sort: { ...queryOptions.sort, ...data } })
  }

  return (
    <>
      <CommunityCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <CommunityCreateUpdateForm
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
          name="Community"
          dataRef={dataRef}
          allColumns={allColumns}
          columnKeys={columns}
          contextMenu={contextMenu}
          sortMenu={sortMenu}
          initialSort={initialSort}
          onChangeSort={onChangeSort}
          onChangeTableConfig={onChangeTableConfig}
          onClickCreate={() => setIsCreateFormOpen(true)}
        />
      ) : (
        ''
      )}
    </>
  )
}

export default CommunityListPage

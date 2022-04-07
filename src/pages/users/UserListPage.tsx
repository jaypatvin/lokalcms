import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import { getUsers, UserFilterType } from '../../services/users'
import { useAuth } from '../../contexts/AuthContext'
import { User } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import { Column, ContextMenu, FiltersMenu, TableConfig } from '../../components/DynamicTable/types'
import UserCreateUpdateForm from './UserCreateUpdateForm'
import { useCommunity } from '../../components/BasePage'
import { ConfirmationDialog } from '../../components/Dialog'

type UserData = User & {
  id: string
}

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Email',
    key: 'email',
  },
  {
    type: 'image',
    title: 'Profile photo',
    key: 'profile_photo',
  },
  {
    type: 'string',
    title: 'First name',
    key: 'first_name',
  },
  {
    type: 'string',
    title: 'Last name',
    key: 'last_name',
  },
  {
    type: 'string',
    title: 'Display name',
    key: 'display_name',
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
    title: 'Birthdate',
    key: 'birthdate',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
  },
  {
    type: 'number',
    title: 'Activity likes',
    key: '_meta.activities_likes_count',
  },
  {
    type: 'number',
    title: 'Orders as buyer',
    key: '_meta.orders_as_buyer_count',
  },
  {
    type: 'number',
    title: 'Orders as seller',
    key: '_meta.orders_as_seller_count',
  },
  {
    type: 'number',
    title: 'Subscription plans as buyer',
    key: '_meta.product_subscription_plans_as_buyer_count',
  },
  {
    type: 'number',
    title: 'Subscription plans as seller',
    key: '_meta.product_subscription_plans_as_seller_count',
  },
  {
    type: 'number',
    title: 'Products',
    key: '_meta.products_count',
  },
  {
    type: 'number',
    title: 'Product likes',
    key: '_meta.products_likes_count',
  },
  {
    type: 'number',
    title: 'Reviews',
    key: '_meta.reviews_count',
  },
  {
    type: 'number',
    title: 'Shops',
    key: '_meta.shops_count',
  },
  {
    type: 'number',
    title: 'Shop likes',
    key: '_meta.shops_likes_count',
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

const columns = ['email', 'display_name', 'community_id', 'created_at', 'updated_at']

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
        key: 'active',
        name: 'Active',
      },
      {
        key: 'suspended',
        name: 'Suspended',
      },
      {
        key: 'pending',
        name: 'Pending',
      },
      {
        key: 'locked',
        name: 'Locked',
      },
    ],
  },
  {
    title: 'Role',
    id: 'role',
    options: [
      {
        key: 'all',
        name: 'All',
      },
      {
        key: 'admin',
        name: 'Admin',
      },
      {
        key: 'editor',
        name: 'Editor',
      },
      {
        key: 'member',
        name: 'Member',
      },
    ],
  },
]

const initialFilter = {
  status: 'all',
  role: 'all',
  archived: false,
}

type FormData = {
  id: string
  status: string
  email: string
  first_name: string
  last_name: string
  display_name: string
  community_id: string
  profile_photo?: string
  street: string
  is_admin: boolean
}

const UserListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [dataRef, setDataRef] = useState<firebase.default.firestore.Query<User>>()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as UserFilterType,
    community: community?.id,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    setDataRef(getUsers(queryOptions))
  }, [queryOptions])
  const normalizeData = (data: UserData) => {
    return {
      id: data.id,
      status: data.status,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      display_name: data.display_name,
      community_id: data.community_id,
      profile_photo: data.profile_photo,
      street: data.address.street,
      is_admin: data.roles.admin,
    }
  }

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/users/${id}`
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
      let url = `${API_URL}/users/${data.id}/unarchive`
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
        setDataToUpdate(normalizeData(data as UserData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as UserData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as UserData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as UserData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as UserData).archived
      },
    },
  ]

  const onChangeFilter = (data: { [x: string]: unknown }) => {
    setQueryOptions({ ...queryOptions, filter: { ...queryOptions.filter, ...data } })
  }

  const onChangeTableConfig = (data: TableConfig) => {
    setQueryOptions({ ...queryOptions, ...data })
  }

  return (
    <>
      <UserCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <UserCreateUpdateForm
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
        descriptions={`Are you sure you want to archive ${dataToUpdate?.email}?`}
        acceptLabel="Archive"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => onUnarchive(dataToUpdate)}
        color="primary"
        title="Unarchive"
        descriptions={`Are you sure you want to unarchive ${dataToUpdate?.email}?`}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {dataRef ? (
        <DynamicTable
          name="User"
          dataRef={dataRef}
          allColumns={allColumns}
          columnKeys={columns}
          contextMenu={contextMenu}
          filtersMenu={filtersMenu}
          initialFilter={initialFilter}
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

export default UserListPage

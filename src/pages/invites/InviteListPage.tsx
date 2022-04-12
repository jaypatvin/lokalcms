import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import { getInvites, InviteFilterType, InviteSort } from '../../services/invites'
import { useAuth } from '../../contexts/AuthContext'
import { Invite } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  ContextMenu,
  FiltersMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import InviteCreateUpdateForm from './InviteCreateUpdateForm'
import { useCommunity } from '../../components/BasePage'
import { ConfirmationDialog } from '../../components/Dialog'

type InviteData = Invite & {
  id: string
}

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Invitee',
    key: 'invitee_email',
  },
  {
    type: 'reference',
    title: 'Inviter',
    key: 'inviter',
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
    title: 'Code',
    key: 'code',
  },
  {
    type: 'boolean',
    title: 'Claimed',
    key: 'claimed',
  },
  {
    type: 'datefuture',
    title: 'Expire by',
    key: 'expire_by',
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

const columns = [
  'invitee_email',
  'inviter',
  'community_id',
  'code',
  'claimed',
  'expire_by',
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
        key: 'created_at',
        name: 'Created at',
      },
      {
        key: 'updated_at',
        name: 'Updated at',
      },
      {
        key: 'expire_by',
        name: 'Expire by',
      },
    ],
  },
]

const initialFilter = {
  status: 'all',
  claimed: 'all',
  archived: false,
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

type FormData = {
  id: string
  email: string
  user_id: string
  expire_by: number
  code: string
  status: string
  claimed: boolean
}

const InviteListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [dataRef, setDataRef] = useState<firebase.default.firestore.Query<Invite>>()
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as InviteFilterType,
    community: community?.id,
    sort: initialSort as InviteSort,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    setDataRef(getInvites(queryOptions))
  }, [queryOptions])

  useEffect(() => {
    setQueryOptions({ ...queryOptions, community: community.id })
  }, [community])

  const normalizeData = (data: InviteData) => {
    return {
      id: data.id,
      email: data.invitee_email,
      user_id: data.inviter,
      expire_by: data.expire_by,
      code: data.code,
      status: data.status,
      claimed: data.claimed,
    }
  }

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/invite/${id}`
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
      let url = `${API_URL}/invite/${data.id}/unarchive`
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
        setDataToUpdate(normalizeData(data as InviteData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as InviteData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as InviteData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as InviteData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as InviteData).archived
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
      <InviteCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <InviteCreateUpdateForm
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
        descriptions={'Are you sure you want to archive the invite?'}
        acceptLabel="Archive"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => onUnarchive(dataToUpdate)}
        color="primary"
        title="Unarchive"
        descriptions={'Are you sure you want to unarchive the invite?'}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      {dataRef ? (
        <DynamicTable
          name="Invite"
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

export default InviteListPage

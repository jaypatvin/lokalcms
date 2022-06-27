import React, { useEffect, useState } from 'react'
import { API_URL } from '../../config/variables'
import {
  getActivities,
  ActivityFilterType,
  ActivitySort,
  ActivitiesResponse,
} from '../../services/activities'
import { useAuth } from '../../contexts/AuthContext'
import { Activity } from '../../models'
import DynamicTable from '../../components/DynamicTable/DynamicTable'
import {
  Column,
  ContextMenu,
  FiltersMenu,
  SortMenu,
  TableConfig,
} from '../../components/DynamicTable/types'
import ActivityCreateUpdateForm from './ActivityCreateUpdateForm'
import { useCommunity } from '../../components/BasePage'
import { ConfirmationDialog } from '../../components/Dialog'

type ActivityData = Activity & {
  id: string
}

const allColumns: Column[] = [
  {
    type: 'string',
    title: 'Id',
    key: 'id',
    referenceLink: '/activities/:id',
  },
  {
    type: 'string',
    title: 'Message',
    key: 'message',
  },
  {
    type: 'gallery',
    title: 'Images',
    key: 'images',
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
    title: 'Community',
    key: 'community_id',
    collection: 'community',
    referenceField: 'name',
  },
  {
    type: 'string',
    title: 'Status',
    key: 'status',
  },
  {
    type: 'number',
    title: 'Comments',
    key: '_meta.comments_count',
  },{
    type: 'number',
    title: 'Likes',
    key: '_meta.likes_count',
  },{
    type: 'number',
    title: 'Reports',
    key: '_meta.reports_count',
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

const columns = ['id', 'message', 'images', 'user_id', 'community_id', 'created_at', 'updated_at']

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
    ],
  },
]

const initialFilter = {
  status: 'all',
  archived: false,
}

const initialSort = {
  sortOrder: 'desc',
  sortBy: 'created_at',
}

type FormData = {
  id: string
  message: string
  user_id: string
  status: string
}

const ActivityListPage = () => {
  const { firebaseToken } = useAuth()
  const community = useCommunity()
  const [data, setData] = useState<ActivitiesResponse>()
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false)
  const [dataToUpdate, setDataToUpdate] = useState<FormData>()
  const [queryOptions, setQueryOptions] = useState({
    search: '',
    limit: 10 as TableConfig['limit'],
    filter: initialFilter as ActivityFilterType,
    community: community?.id,
    sort: initialSort as ActivitySort,
  })
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)

  useEffect(() => {
    if (firebaseToken) {
      setIsLoading(true)
      getActivities(queryOptions, firebaseToken)
        .then((data) => setData(data))
        .finally(() => setIsLoading(false))
    }
  }, [queryOptions])

  useEffect(() => {
    setQueryOptions({ ...queryOptions, community: community.id })
  }, [community])

  const normalizeData = (data: ActivityData) => {
    return {
      id: data.id,
      message: data.message,
      user_id: data.user_id,
      status: data.status,
    }
  }

  const onArchive = async (data?: FormData) => {
    if (!data) return
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/activities/${id}`
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
      let url = `${API_URL}/activities/${data.id}/unarchive`
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
        setDataToUpdate(normalizeData(data as ActivityData))
        setIsUpdateFormOpen(true)
      },
    },
    {
      title: 'Archive',
      type: 'danger',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ActivityData))
        setIsArchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return !(data as ActivityData).archived
      },
    },
    {
      title: 'Unarchive',
      type: 'warning',
      onClick: (data) => {
        setDataToUpdate(normalizeData(data as ActivityData))
        setIsUnarchiveDialogOpen(true)
      },
      showOverride: (data) => {
        return (data as ActivityData).archived
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
      <ActivityCreateUpdateForm
        isOpen={isCreateFormOpen}
        setIsOpen={setIsCreateFormOpen}
        mode="create"
        isModal
      />
      <ActivityCreateUpdateForm
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
        descriptions={'Are you sure you want to archive the activity?'}
        acceptLabel="Archive"
        cancelLabel="Cancel"
      />
      <ConfirmationDialog
        isOpen={isUnarchiveDialogOpen}
        onClose={() => setIsUnarchiveDialogOpen(false)}
        onAccept={() => onUnarchive(dataToUpdate)}
        color="primary"
        title="Unarchive"
        descriptions={'Are you sure you want to unarchive the activity?'}
        acceptLabel="Unarchive"
        cancelLabel="Cancel"
      />
      <DynamicTable
        name="Activity"
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

export default ActivityListPage

import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { API_URL } from '../../config/variables'
import {
  GenericGetArgType,
  InviteFilterType,
  InviteSortByType,
  SortOrderType,
} from '../../utils/types'
import { useAuth } from '../../contexts/AuthContext'
import { fetchUserByID } from '../../services/users'
import { getInvites } from '../../services/invites'
import { DocumentType, Invite } from '../../models'

const InviteListPage = () => {
  const { firebaseToken } = useAuth()
  const [filter, setFilter] = useState<InviteFilterType>('all')
  const [sortBy, setSortBy] = useState<InviteSortByType>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc')
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
      key: 'claimed',
      name: 'Claimed',
    },
    {
      key: 'not_claimed',
      name: 'Not Claimed',
    },
    {
      key: 'archived',
      name: 'Archived',
    },
  ]
  const columns = [
    {
      label: 'Invitee Email',
      fieldName: 'invitee_email',
      sortable: true,
    },
    {
      label: 'Inviter',
      fieldName: 'user_id',
      sortable: false,
    },
    {
      label: 'Code',
      fieldName: 'code',
      sortable: false,
    },
    {
      label: 'Status',
      fieldName: 'status',
      sortable: false,
    },
    {
      label: 'Claimed',
      fieldName: 'claimed',
      sortable: false,
    },
    {
      label: 'Expire by',
      fieldName: 'expire_by',
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
  const setupDataList = async (docs: FirebaseFirestore.QueryDocumentSnapshot<Invite>[]) => {
    const newList = docs.map((doc) => ({ id: doc.id, ...doc.data(), inviter_email: '' }))
    for (let i = 0; i < newList.length; i++) {
      const data = newList[i]
      if (data.inviter) {
        const inviter = await fetchUserByID(data.inviter)
        const inviterData = inviter.data()
        if (inviterData) {
          data.inviter_email = inviterData.email
        }
      }
    }
    return newList
  }
  const normalizeData = (data: Invite & { id: string }) => {
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

  const onArchive = async (data: DocumentType) => {
    let res
    if (API_URL && firebaseToken) {
      const { id } = data
      let url = `${API_URL}/invite/${id}`
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
      let url = `${API_URL}/invite/${data.id}/unarchive`
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
    return getInvites({ filter, sortBy, sortOrder, search, limit, community })
  }

  return (
    <ListPage
      name="invites"
      menuName="Invites"
      filterMenuOptions={menuOptions}
      createLabel="New Invite"
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

export default InviteListPage

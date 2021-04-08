import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import { HistoryLogFilterType, HistoryLogSortByType, SortOrderType } from '../../utils/types'
import { getHistoryLogs } from '../../services/historyLog'
import { fetchUserByID } from '../../services/users'
import { fetchCommunityByID } from '../../services/community'

const HistoryListPage = (props: any) => {
  const [filter, setFilter] = useState<HistoryLogFilterType>('all')
  const [sortBy, setSortBy] = useState<HistoryLogSortByType>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc')
  const menuOptions = [
    {
      key: 'all',
      name: 'All Methods',
    },
    {
      key: 'create',
      name: 'Create',
    },
    {
      key: 'update',
      name: 'Update',
    },
    {
      key: 'archive',
      name: 'Archive',
    },
    {
      key: 'delete',
      name: 'Delete',
    },
  ]
  const columns = [
    {
      label: 'Actor',
      fieldName: 'actor_id',
      sortable: false,
    },
    {
      label: 'Source',
      fieldName: 'source',
      sortable: true,
    },
    {
      label: 'Method',
      fieldName: 'method',
      sortable: true,
    },
    {
      label: 'Community',
      fieldName: 'community_id',
      sortable: false,
    },
    {
      label: 'Collection',
      fieldName: 'collection_name',
      sortable: true,
    },
    {
      label: 'Document',
      fieldName: 'document_id',
      sortable: false,
    },
    {
      label: 'Created At',
      fieldName: 'created_at',
      sortable: true,
    },
  ]
  const setupDataList = async (
    docs: firebase.default.firestore.QueryDocumentSnapshot<firebase.default.firestore.DocumentData>[]
  ) => {
    const newList = docs.map((doc): any => ({ id: doc.id, ...doc.data() }))
    console.log('newList', newList)
    for (let i = 0; i < newList.length; i++) {
      const data = newList[i]
      if (data.actor_id) {
        const user = await fetchUserByID(data.actor_id)
        const userData = user.data()
        if (userData) {
          data.actor_email = userData.email
        }
      }
      const community = await fetchCommunityByID(data.community_id)
      const communityData = community.data()
      if (communityData) {
        data.community_name = communityData.name
      }
    }
    console.log('newList', newList)
    return newList
  }

  return (
    <ListPage
      name="history_logs"
      menuName="History"
      filterMenuOptions={menuOptions}
      columns={columns}
      filter={filter}
      onChangeFilter={setFilter}
      sortBy={sortBy}
      onChangeSortBy={setSortBy}
      sortOrder={sortOrder}
      onChangeSortOrder={setSortOrder}
      getData={getHistoryLogs}
      setupDataList={setupDataList}
    />
  )
}

export default HistoryListPage

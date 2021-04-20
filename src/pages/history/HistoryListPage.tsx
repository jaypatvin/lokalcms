import React, { useState } from 'react'
import ListPage from '../../components/pageComponents/ListPage'
import {
  FilterGroupsType,
  GenericGetArgType,
  HistoryLogFilterType,
  HistoryLogSortByType,
  HistoryLogSourceType,
  SortOrderType,
} from '../../utils/types'
import { getHistoryLogs } from '../../services/historyLog'
import { fetchUserByID } from '../../services/users'
import { fetchCommunityByID } from '../../services/community'

const HistoryListPage = (props: any) => {
  const [filter, setFilter] = useState<HistoryLogFilterType>('all')
  const [sourceFilter, setSourceFilter] = useState<HistoryLogSourceType>('all_sources')
  const [sortBy, setSortBy] = useState<HistoryLogSortByType>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrderType>('desc')
  const filterMenus: FilterGroupsType = [
    {
      selected: filter,
      options: [
        {
          key: 'all',
          name: 'All Methods',
          onClick: () => setFilter('all'),
        },
        {
          key: 'create',
          name: 'Create',
          onClick: () => setFilter('create'),
        },
        {
          key: 'update',
          name: 'Update',
          onClick: () => setFilter('update'),
        },
        {
          key: 'archive',
          name: 'Archive',
          onClick: () => setFilter('archive'),
        },
        {
          key: 'delete',
          name: 'Delete',
          onClick: () => setFilter('delete'),
        },
      ],
    },
    {
      selected: sourceFilter,
      options: [
        {
          key: 'all_sources',
          name: 'All Sources',
          onClick: () => setSourceFilter('all_sources'),
        },
        {
          key: 'cms',
          name: 'CMS',
          onClick: () => setSourceFilter('cms'),
        },
        {
          key: 'mobile_app',
          name: 'Mobile App',
          onClick: () => setSourceFilter('mobile_app'),
        },
        {
          key: 'api',
          name: 'Direct API calls',
          onClick: () => setSourceFilter('api'),
        },
        {
          key: 'db',
          name: 'Direct from Database',
          onClick: () => setSourceFilter('db'),
        },
      ],
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
      sortable: false,
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

  const getData = ({ search, limit }: GenericGetArgType) =>
    getHistoryLogs({ filter, sourceFilter, sortBy, sortOrder, search, limit })

  return (
    <ListPage
      name="history_logs"
      menuName="History"
      filterMenus={filterMenus}
      columns={columns}
      filter={filter}
      onChangeFilter={setFilter}
      sortBy={sortBy}
      onChangeSortBy={setSortBy}
      sortOrder={sortOrder}
      onChangeSortOrder={setSortOrder}
      getData={getData}
      setupDataList={setupDataList}
    />
  )
}

export default HistoryListPage

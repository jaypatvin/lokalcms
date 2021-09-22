import {
  SortOrderType,
  HistoryLogSortByType,
  HistoryLogFilterType,
  HistoryLogSourceType,
} from '../utils/types'
import { db } from './firebase'

type GetActivitiesParamTypes = {
  search?: string
  filter?: HistoryLogFilterType
  sourceFilter?: HistoryLogSourceType
  sortBy?: HistoryLogSortByType
  sortOrder?: SortOrderType
  limit?: number
  community?: string
}

export const getHistoryLogs = ({
  search = '',
  filter = 'all',
  sourceFilter = 'all_sources',
  sortBy = 'created_at',
  sortOrder = 'desc',
  limit = 10,
  community,
}: GetActivitiesParamTypes) => {
  let ref = db.collection('history_logs').where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (['create', 'update', 'archive', 'delete'].includes(filter)) {
    ref = ref.where('method', '==', filter)
  }
  if (['cms', 'mobile_app', 'api', 'db'].includes(sourceFilter)) {
    ref = ref.where('source', '==', sourceFilter)
  }
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

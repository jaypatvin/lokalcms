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
}

export const getHistoryLogs = ({
  search = '',
  filter = 'all',
  sourceFilter = 'all_sources',
  sortBy = 'created_at',
  sortOrder = 'desc',
  limit = 10,
}: GetActivitiesParamTypes) => {
  let ref: any = db.collection('history_logs')

  if (search) ref = ref.where('keywords', 'array-contains', search.toLowerCase())
  if (['create', 'update', 'archive', 'delete'].includes(filter)) {
    ref = ref.where('method', '==', filter)
  }
  if (['cms', 'mobile_app', 'api', 'db'].includes(sourceFilter)) {
    ref = ref.where('source', '==', sourceFilter)
  }
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

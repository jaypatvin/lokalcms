import { SortOrderType, HistoryLogSortByType, HistoryLogFilterType } from '../utils/types'
import { db } from './firebase'

type GetActivitiesParamTypes = {
  search?: string
  filter?: HistoryLogFilterType
  sortBy?: HistoryLogSortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const getHistoryLogs = ({
  search = '',
  filter = 'all',
  sortBy = 'created_at',
  sortOrder = 'desc',
  limit = 10,
}: GetActivitiesParamTypes) => {
  let ref: any = db.collection('history_logs')

  if (search) ref = ref.where('keywords', 'array-contains', search.toLowerCase())
  if (['create', 'update', 'archive', 'delete'].includes(filter)) {
    ref = ref.where('method', '==', filter)
  }
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

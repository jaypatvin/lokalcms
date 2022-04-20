import { SortOrderType } from '../utils/types'
import { db } from '../utils'

export type ApplicationLogFilterType = {
  actionType: 'all' | string
  isAuthenticated: 'all' | boolean
}

export type ApplicationLogSort = {
  sortBy: 'created_at'
  sortOrder: SortOrderType
}

type GetApplicationLogsParamTypes = {
  filter?: ApplicationLogFilterType
  userId?: string
  communityId: string
  limit?: number
  sort?: ApplicationLogSort
}

export const getApplicationLogsByUser = (user_id: string, limit = 10) => {
  return db.applicationLogs
    .where('user_id', '==', user_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getApplicationLogsByCommunity = (community_id: string, limit = 10) => {
  return db.applicationLogs
    .where('community_id', '==', community_id)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getApplicationLogs = ({
  userId,
  communityId,
  limit = 10,
  filter = {
    actionType: 'all',
    isAuthenticated: 'all',
  },
  sort = { sortBy: 'created_at', sortOrder: 'desc' },
}: GetApplicationLogsParamTypes) => {
  let ref = db.applicationLogs.where('community_id', '==', communityId)

  if (filter.actionType !== 'all') {
    ref = ref.where('action_type', '==', filter.actionType)
  }

  if (userId) {
    ref = ref.where('user_id', '==', userId)
  }
  ref = ref.orderBy(sort.sortBy, sort.sortOrder).limit(limit)

  return ref
}

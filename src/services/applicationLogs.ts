import { SortOrderType } from '../utils/types'
import { db } from '../utils'

type GetApplicationLogsParamTypes = {
  action_type?: string
  user_id?: string
  community_id: string
  limit?: number
  sortOrder?: SortOrderType
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
  action_type,
  user_id,
  community_id,
  limit = 10,
  sortOrder = 'desc',
}: GetApplicationLogsParamTypes) => {
  let ref = db.applicationLogs.where('community_id', '==', community_id)
  if (action_type) {
    ref = ref.where('action_type', '==', action_type)
  }
  if (user_id) {
    ref = ref.where('user_id', '==', user_id)
  }
  ref = ref.orderBy('created_at', sortOrder).limit(limit)

  return ref
}

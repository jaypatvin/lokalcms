import { SortOrderType, ActivitySortByType, ActivityFilterType } from '../utils/types'
import { db } from '../utils'

type GetActivitiesParamTypes = {
  search?: string
  filter?: ActivityFilterType
  sortBy?: ActivitySortByType
  sortOrder?: SortOrderType
  limit?: number
  community?: string
}

export const fetchActivityByID = async (id: string) => {
  return db.activities.doc(id).get()
}

export const getActivitiesByUser = (user_id: string, limit = 10) => {
  return db.activities
    .where('user_id', '==', user_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getActivitiesByCommunity = (community_id: string, limit = 10) => {
  return db.activities
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getActivities = ({
  filter = 'all',
  sortBy = 'created_at',
  sortOrder = 'asc',
  limit = 10,
  community,
}: GetActivitiesParamTypes) => {
  let ref = db.activities.where('archived', '==', filter === 'archived')

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

import { SortOrderType, ActivitySortByType, ActivityFilterType } from '../utils/types'
import { db } from './firebase'

type GetActivitiesParamTypes = {
  search?: string
  filter?: ActivityFilterType
  sortBy?: ActivitySortByType
  sortOrder?: SortOrderType
  limit?: number
  community?: string
}

export const fetchActivityByID = async (id: string) => {
  return db.collection('activities').doc(id).get()
}

export const getActivitiesByUser = (user_id: string, limit = 10) => {
  return db
    .collection('activities')
    .where('user_id', '==', user_id)
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
  let ref: any = db.collection('activities')

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  return ref
}

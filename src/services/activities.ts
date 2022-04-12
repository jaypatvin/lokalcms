import { SortOrderType, ActivitySortByType } from '../utils/types'
import { db } from '../utils'

export type ActivityFilterType = {
  status: string
  archived?: boolean
}

export type ActivitySort = {
  sortBy: ActivitySortByType
  sortOrder: SortOrderType
}

type GetActivitiesParamTypes = {
  search?: string
  filter?: ActivityFilterType
  sort?: ActivitySort
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
  filter = { status: 'all', archived: false },
  sort = { sortBy: 'created_at', sortOrder: 'desc' },
  limit = 10,
  community,
}: GetActivitiesParamTypes) => {
  let ref = db.activities.where('archived', '==', filter.archived)

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (filter.status !== 'all') {
    ref = ref.where('status', '==', filter.status)
  }

  ref = ref.orderBy(sort.sortBy, sort.sortOrder).limit(limit)

  return ref
}

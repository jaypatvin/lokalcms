import { SortOrderType, ActivitySortByType, ActivityFilterType } from '../utils/types'
import { db } from './firebase'

type GetActivitiesParamTypes = {
  search?: string
  filter?: ActivityFilterType
  sortBy?: ActivitySortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const fetchActivityByID = async (id: string) => {
  return db.collection('categories').doc(id).get()
}

export const getActivities = ({
  search = '',
  filter = 'all',
  sortBy = 'created_at',
  sortOrder = 'asc',
  limit = 10,
}: GetActivitiesParamTypes) => {
  let ref: any = db.collection('activities')

  if (search) ref = ref.where('keywords', 'array-contains', search.toLowerCase())
  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref.where('archived', '==', filter === 'archived')
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

import { SortOrderType, CommunitySortByType } from '../utils/types'
import { db, auth } from './firebase'

export const fetchCommunityByID = async (id: string) => {
  return db.collection('community').doc(id).get()
}

type GetCommunitiesParamTypes = {
  search?: string
  sortBy?: CommunitySortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const getCommunities = ({
  search = '',
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 50,
}: GetCommunitiesParamTypes) => {
  let ref = db.collection('community').where('keywords', 'array-contains', search.toLowerCase())

  if (sortBy === 'name') {
    ref = ref.orderBy('name', sortOrder).limit(limit)
  } else {
    ref = ref.orderBy(`address.${sortBy}`, sortOrder).limit(limit)
  }

  return ref
}

import { SortOrderType, CommunitySortByType, CommunityFilterType } from '../utils/types'
import { db, auth } from './firebase'

export const fetchCommunityByID = async (id: string) => {
  return db.collection('community').doc(id).get()
}

type GetCommunitiesParamTypes = {
  search?: string
  filter?: CommunityFilterType
  sortBy?: CommunitySortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const getCommunities = ({
  search = '',
  filter,
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 50,
}: GetCommunitiesParamTypes) => {
  return db
    .collection('community')
    .where('keywords', 'array-contains', search.toLowerCase())
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)
}

export const communityHaveMembers = async (id: string) => {
  let user = await db.collection('users').where('community_id', '==', id).limit(1).get()
  return !user.empty
}

export const getCommunityMeta = async (id: string) => {
  let meta = await db.collection('_meta').doc('community').collection('_meta').doc(id).get()
  return meta.data() || {}
}

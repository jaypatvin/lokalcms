import { SortOrderType, CommunitySortByType, CommunityFilterType } from '../utils/types'
import { db } from '../utils'

export const fetchCommunityByID = async (id: string) => {
  return db.community.doc(id).get()
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
  return db.community
    .where('keywords', 'array-contains', search.toLowerCase())
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)
}

export const communityHaveMembers = async (id: string) => {
  let user = await db.users.where('community_id', '==', id).limit(1).get()
  return !user.empty
}

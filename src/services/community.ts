import { SortOrderType, CommunitySortByType } from '../utils/types'
import { db } from '../utils'

export const fetchCommunityByID = async (id: string) => {
  return db.community.doc(id).get()
}

export type CommunityFilterType = {
  archived?: boolean
}

export type CommunitySort = {
  sortBy: CommunitySortByType
  sortOrder: SortOrderType
}

type GetCommunitiesParamTypes = {
  search?: string
  filter?: CommunityFilterType
  sort?: CommunitySort
  limit?: number
}

export const getCommunities = ({
  search = '',
  filter = { archived: false },
  sort = { sortBy: 'name', sortOrder: 'asc' },
  limit = 50,
}: GetCommunitiesParamTypes) => {
  return db.community
    .where('keywords', 'array-contains', search.toLowerCase())
    .where('archived', '==', filter === 'archived')
    .orderBy(sort.sortBy, sort.sortOrder)
    .limit(limit)
}

export const communityHaveMembers = async (id: string) => {
  let user = await db.users.where('community_id', '==', id).limit(1).get()
  return !user.empty
}

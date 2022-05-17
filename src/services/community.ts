import { SortOrderType, CommunitySortByType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { Community } from '../models'

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
  page?: number
}

export type CommunitiesResponse = {
  pages: number
  totalItems: number
  data: (Community & { id: string })[]
}

export const getCommunities = async (
  {
    search = '',
    filter = { archived: false },
    sort = { sortBy: 'name', sortOrder: 'asc' },
    limit = 10,
    page = 0,
  }: GetCommunitiesParamTypes,
  firebaseToken: string
): Promise<CommunitiesResponse | undefined> => {
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  }
  if (search) {
    params.q = search
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/communities?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'get',
      })
    ).json()
    return res
  }

  console.error('environment variable for the api does not exist.')
}

export const communityHaveMembers = async (id: string) => {
  let user = await db.users.where('community_id', '==', id).limit(1).get()
  return !user.empty
}

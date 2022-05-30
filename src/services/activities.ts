import { SortOrderType, ActivitySortByType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { Activity } from '../models'

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
  page?: number
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

export type ActivitiesResponse = {
  pages: number
  totalItems: number
  data: (Activity & { id: string })[]
}

export const getActivities = async (
  {
    search = '',
    filter = { status: 'all', archived: false },
    sort = { sortBy: 'created_at', sortOrder: 'asc' },
    limit = 10,
    page = 0,
    community,
  }: GetActivitiesParamTypes,
  firebaseToken: string
): Promise<ActivitiesResponse | undefined> => {
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  }
  if (search) {
    params.q = search
  }
  if (community) {
    params.community = community
  }
  if (filter.status !== 'all') {
    params.status = filter.status
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/activities?${searchParams}`, {
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

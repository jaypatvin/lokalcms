import { SortOrderType, ShopSortByType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { Shop } from '../models'

export type ShopFilterType = {
  status: string
  isClose: 'all' | boolean
  archived?: boolean
}

export type ShopSort = {
  sortBy: ShopSortByType
  sortOrder: SortOrderType
}

type GetShopsParamTypes = {
  search?: string
  filter?: ShopFilterType
  sort?: ShopSort
  limit?: number
  page?: number
  community?: string
}

export const fetchShopByID = async (id: string) => {
  return db.shops.doc(id).get()
}

export const getAllShopsByCommunity = (community_id: string) => {
  return db.shops.where('community_id', '==', community_id).where('archived', '==', false)
}

export const getShopsByUser = (user_id: string, limit = 10) => {
  return db.shops
    .where('user_id', '==', user_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getShopsByCommunity = (community_id: string, limit = 10) => {
  return db.shops
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export type ShopsResponse = {
  pages: number
  totalItems: number
  data: (Shop & { id: string })[]
}

export const getShops = async (
  {
    search = '',
    filter = { status: 'all', isClose: 'all', archived: false },
    sort = { sortBy: 'name', sortOrder: 'asc' },
    limit = 10,
    page = 0,
    community,
  }: GetShopsParamTypes,
  firebaseToken: string
): Promise<ShopsResponse | undefined> => {
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
      await fetch(`${API_URL}/shops?${searchParams}`, {
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

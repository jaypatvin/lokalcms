import { SortOrderType, ShopSortByType } from '../utils/types'
import { db } from '../utils'

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

export const getShops = ({
  search = '',
  filter = { status: 'all', isClose: 'all', archived: false },
  sort = { sortBy: 'name', sortOrder: 'asc' },
  limit = 10,
  community,
}: GetShopsParamTypes) => {
  let ref = db.shops.where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (filter.status !== 'all') {
    ref = ref.where('status', '==', filter.status)
  }
  if (filter.isClose !== 'all') {
    ref = ref.where('is_close', '==', filter.isClose)
  }

  ref = ref
    .where('archived', '==', filter.archived)
    .orderBy(sort.sortBy, sort.sortOrder)
    .limit(limit)

  return ref
}

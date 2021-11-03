import { SortOrderType, ShopSortByType, ShopFilterType } from '../utils/types'
import { db } from './firebase'

type GetShopsParamTypes = {
  search?: string
  filter?: ShopFilterType
  sortBy?: ShopSortByType
  sortOrder?: SortOrderType
  limit?: number
  community?: string
}

export const fetchShopByID = async (id: string) => {
  return db.collection('shops').doc(id).get()
}

export const getShopsByCommunity = (community_id: string) => {
  return db
    .collection('shops')
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
}

export const getShopsByUser = (user_id: string, limit = 10) => {
  return db
    .collection('shops')
    .where('user_id', '==', user_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getShops = ({
  search = '',
  filter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 10,
  community,
}: GetShopsParamTypes) => {
  let ref = db.collection('shops').where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  } else if (['close', 'open'].includes(filter)) {
    const is_close = filter === 'close'
    ref = ref.where('is_close', '==', is_close)
  }
  ref = ref
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  return ref
}

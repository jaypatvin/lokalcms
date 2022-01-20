import { SortOrderType, ProductSortByType, ProductFilterType } from '../utils/types'
import { db } from '../utils'

type GetProductsParamTypes = {
  search?: string
  filter?: ProductFilterType
  sortBy?: ProductSortByType
  sortOrder?: SortOrderType
  limit?: number
  community?: any
}

export const fetchProductByID = async (id: string) => {
  return db.products.doc(id).get()
}

export const getProductsByShop = (shop_id: string) => {
  return db.products
    .where('shop_id', '==', shop_id)
    .where('archived', '==', false)
    .where('status', '==', 'enabled')
}

export const getLimitedProductsByShop = (shop_id: string, limit = 10) => {
  return db.products
    .where('shop_id', '==', shop_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductsByUser = (user_id: string, limit = 10) => {
  return db.products
    .where('user_id', '==', user_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProductsByCommunity = (community_id: string, limit = 10) => {
  return db.products
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getProducts = ({
  search = '',
  filter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 10,
  community,
}: GetProductsParamTypes) => {
  let ref = db.products.where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  return ref
}

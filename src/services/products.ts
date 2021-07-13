import { SortOrderType, ProductSortByType, ProductFilterType } from '../utils/types'
import { db } from './firebase'

type GetProductsParamTypes = {
  search?: string
  filter?: ProductFilterType
  sortBy?: ProductSortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const fetchProductByID = async (id: string) => {
  return db.collection('products').doc(id).get()
}

export const getProductsByShop = (shop_id: string) => {
  return db
    .collection('products')
    .where('shop_id', '==', shop_id)
    .where('archived', '==', false)
    .where('status', '==', 'enabled')
}

export const getProducts = ({
  search = '',
  filter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 10,
}: GetProductsParamTypes) => {
  let ref = db.collection('products').where('keywords', 'array-contains', search.toLowerCase())
  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  return ref
}

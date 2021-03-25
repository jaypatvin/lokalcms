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

export const getProducts = ({
  search = '',
  filter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 10,
}: GetProductsParamTypes) => {
  let ref: any = db.collection('products')

  if (search) ref = ref.where('keywords', 'array-contains', search.toLowerCase())
  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref.where('archived', '==', filter === 'archived')
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

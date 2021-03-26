import { SortOrderType, CategorySortByType, CategoryFilterType } from '../utils/types'
import { db } from './firebase'

type GetCategoriesParamTypes = {
  search?: string
  filter?: CategoryFilterType
  sortBy?: CategorySortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const fetchCategoryByID = async (id: string) => {
  return db.collection('categories').doc(id).get()
}

export const getCategories = ({
  search = '',
  filter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  limit = 10,
}: GetCategoriesParamTypes) => {
  let ref: any = db.collection('categories')

  if (search) ref = ref.where('keywords', 'array-contains', search.toLowerCase())
  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref.where('archived', '==', filter === 'archived')
  ref = ref.orderBy(sortBy, sortOrder).limit(limit)

  return ref
}

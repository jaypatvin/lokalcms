import { SortOrderType, CategorySortByType, CategoryFilterType } from '../utils/types'
import { db } from '../utils'

type GetCategoriesParamTypes = {
  search?: string
  filter?: CategoryFilterType
  sortBy?: CategorySortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const fetchCategoryByID = async (id: string) => {
  return db.categories.doc(id).get()
}

export const getCategories = ({
  search = '',
  filter = 'all',
  sortBy = 'name',
  sortOrder = 'asc',
  limit,
}: GetCategoriesParamTypes) => {
  let ref = db.categories.where('keywords', 'array-contains', search.toLowerCase())
  if (['enabled', 'disabled'].includes(filter)) {
    ref = ref.where('status', '==', filter)
  }
  ref = ref.where('archived', '==', filter === 'archived').orderBy(sortBy, sortOrder)
  if (limit) ref = ref.limit(limit)

  return ref
}

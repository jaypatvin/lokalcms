import { isNil } from 'lodash'
import { SortOrderType, CategorySortByType } from '../utils/types'
import { db } from '../utils'

export type CategoryFilterType = {
  status: string
  archived?: boolean
}

export type CategorySort = {
  sortBy: CategorySortByType
  sortOrder: SortOrderType
}

type GetCategoriesParamTypes = {
  search?: string
  filter?: CategoryFilterType
  sort?: CategorySort
  limit?: number
}

export const fetchCategoryByID = async (id: string) => {
  return db.categories.doc(id).get()
}

export const getCategories = ({
  search = '',
  filter = { status: 'all', archived: false },
  sort = { sortBy: 'name', sortOrder: 'asc' },
  limit,
}: GetCategoriesParamTypes) => {
  let ref = db.categories.where('keywords', 'array-contains', search.toLowerCase())

  if (filter.status !== 'all') {
    ref = ref.where('status', '==', filter.status)
  }

  ref = ref.where('archived', '==', filter.archived).orderBy(sort.sortBy, sort.sortOrder)

  if (!isNil(limit)) ref = ref.limit(limit)

  return ref
}

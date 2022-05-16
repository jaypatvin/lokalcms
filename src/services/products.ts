import { SortOrderType, ProductSortByType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { Product } from '../models'

export type ProductFilterType = {
  status: string
  archived?: boolean
}

export type ProductSort = {
  sortBy: ProductSortByType
  sortOrder: SortOrderType
}

type GetProductsParamTypes = {
  search?: string
  filter?: ProductFilterType
  sort?: ProductSort
  limit?: number
  page?: number
  community?: string
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

export type ProductsResponse = {
  pages: number
  totalItems: number
  data: (Product & { id: string })[]
}

export const getProducts = async (
  {
    search = '',
    filter = { status: 'all', archived: false },
    sort = { sortBy: 'name', sortOrder: 'asc' },
    limit = 10,
    page = 0,
    community,
  }: GetProductsParamTypes,
  firebaseToken: string
): Promise<ProductsResponse | undefined> => {
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
      await fetch(`${API_URL}/products?${searchParams}`, {
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

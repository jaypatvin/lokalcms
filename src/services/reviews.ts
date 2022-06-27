import { API_URL } from '../config/variables'
import { Review } from '../models'
import { db } from '../utils'
import { SortOrderType } from '../utils/types'

type GetReviewsByUserParamTypes = {
  userId: string
  limit?: number
}

type GetReviewsByProductParamTypes = {
  productId: string
  limit?: number
}

export const getReviewsByProduct = ({ productId, limit = 10 }: GetReviewsByProductParamTypes) => {
  return db.getProductReviews(`products/${productId}/reviews`).limit(limit)
}

export const getReviewsByUser = ({ userId, limit = 10 }: GetReviewsByUserParamTypes) => {
  return db.reviews.where('user_id', '==', userId).limit(limit)
}

export type ReviewFilterType = {
  community?: string
  shop?: string
  product?: string
  order?: string
  rating?: number | 'all'
  user?: string
}

export type ReviewSort = {
  sortBy: 'created_at' | 'rating'
  sortOrder: SortOrderType
}

type GetReviewsParamTypes = {
  filter?: ReviewFilterType
  search?: string
  sort?: ReviewSort
  limit?: number
  page?: number
  community?: string
}

export type ReviewsResponse = {
  pages: number
  totalItems: number
  data: (Review & { id: string })[]
}

export const getReviews = async (
  {
    filter = {},
    search = '',
    sort = { sortBy: 'created_at', sortOrder: 'desc' },
    limit = 50,
    page = 0,
    community,
  }: GetReviewsParamTypes,
  firebaseToken: string
): Promise<ReviewsResponse | undefined> => {
  if (filter.rating === 'all') {
    delete filter.rating
  }
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    ...filter,
  }
  if (search) {
    params.q = search
  }
  if (community) {
    params.community = community
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/reviews?${searchParams}`, {
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

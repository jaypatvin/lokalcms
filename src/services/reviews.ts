import { db } from '../utils'

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

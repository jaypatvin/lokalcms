import { db } from './firebase'

type GetReviewsByUserParamTypes = {
  userId: string
  limit?: number
}

type GetReviewsByProductParamTypes = {
  productId: string
  limit?: number
}

export const getReviewsByProduct = ({ productId, limit = 10 }: GetReviewsByProductParamTypes) => {
  return db
    .collection('products')
    .doc(productId)
    .collection('reviews')
    .limit(limit)
}

export const getReviewsByUser = ({
  userId,
  limit = 10,
}: GetReviewsByUserParamTypes) => {
  return db
    .collectionGroup('reviews')
    .where('user_id', '==', userId)
    .limit(limit)
}

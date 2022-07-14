import { getDocs, query, where } from 'firebase/firestore'
import Review, { ReviewCreateData } from '../models/Review'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const create = (productId: string, data: ReviewCreateData) => {
  return createBaseMethods(db.getProductReviews(`products/${productId}/reviews`)).create(data)
}

export const update = (
  productId: string,
  reviewId: string,
  rating: Review['rating'],
  message: string = ''
) => {
  return createBaseMethods(db.getProductReviews(`products/${productId}/reviews`)).update(
    reviewId,
    { rating, message }
  )
}

export const findReviewsByUser = async (userId: string) => {
  const reviewsQuery = query(db.reviews, where('user_id', '==', userId))
  const snapshot = await getDocs(reviewsQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findAllProductReviews = async (id: string) => {
  return createBaseMethods(db.getProductReviews(`products/${id}/reviews`)).findAll()
}

export const findProductReview = async (productId: string, reviewId: string) => {
  return createBaseMethods(db.getProductReviews(`products/${productId}/reviews`)).findById(reviewId)
}

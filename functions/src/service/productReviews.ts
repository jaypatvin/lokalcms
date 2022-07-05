import * as admin from 'firebase-admin'
import Review, { ReviewCreateData } from '../models/Review'
import db from '../utils/db'

export const getReviewsByUser = async (user_id: string) => {
  return db.reviews
    .where('user_id', '==', user_id)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getAllProductReviews = async (id: string) => {
  return await db
    .getProductReviews(`products/${id}/reviews`)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getProductReview = async (productId: string, reviewId: string) => {
  return await db
    .getProductReviews(`products/${productId}/reviews`)
    .doc(reviewId)
    .get()
    .then((res) => ({ id: res.id, ...res.data() }))
}

export const getProductReviewsByUserId = async (productId: string, userId: string) => {
  return await db
    .getProductReviews(`products/${productId}/reviews`)
    .where('user_id', '==', userId)
    .limit(1)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getProductReviewByOrderId = async (productId: string, order_id: string) => {
  return await db
    .getProductReviews(`products/${productId}/reviews`)
    .where('order_id', '==', order_id)
    .limit(1)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createProductReview = async (id: string, data: ReviewCreateData) => {
  return await db
    .getProductReviews(`products/${id}/reviews`)
    .add({ ...data, created_at: admin.firestore.Timestamp.now() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

export const updateProductReview = async (
  productId: string,
  reviewId: string,
  rating: Review['rating'],
  message: string = ''
) => {
  return await db
    .getProductReviews(`products/${productId}/reviews`)
    .doc(reviewId)
    .update({ rating, message, updated_at: admin.firestore.Timestamp.now() })
}

export const deleteProductReview = async (productId: string, reviewId: string) => {
  return await db.getProductReviews(`products/${productId}/reviews`).doc(reviewId).delete()
}

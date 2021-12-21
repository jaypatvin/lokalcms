import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getReviewsByUser = async (user_id: string) => {
  return db
    .collectionGroup('reviews')
    .where('user_id', '==', user_id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getAllProductReviews = async (id: string) => {
  return await db
    .collection('products')
    .doc(id)
    .collection('reviews')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductReview = async (productId: string, reviewId: string) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('reviews')
    .doc(reviewId)
    .get()
    .then((res): any => ({ id: res.id, ...res.data() }))
}

export const getProductReviewsByUserId = async (productId: string, userId: string) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('reviews')
    .where('user_id', '==', userId)
    .limit(1)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductReviewByOrderId = async (productId: string, order_id: string) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('reviews')
    .where('order_id', '==', order_id)
    .limit(1)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createProductReview = async (id: string, data: any) => {
  return await db
    .collection('products')
    .doc(id)
    .collection('reviews')
    .add(data)
    .then((res) => {
      return res.get()
    })
    .then((doc): any => ({ id: doc.id, ...doc.data(), created_at: new Date() }))
}

export const updateProductReview = async (
  productId: string,
  reviewId: string,
  rating: number,
  message: string = ''
) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('reviews')
    .doc(reviewId)
    .update({ rating, message, updated_at: new Date() })
}

export const deleteProductReview = async (productId: string, reviewId: string) => {
  return await db.collection('products').doc(productId).collection('reviews').doc(reviewId).delete()
}

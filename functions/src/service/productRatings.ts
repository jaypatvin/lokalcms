import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllProductRatings = async (id: string) => {
  return await db
    .collection('products')
    .doc(id)
    .collection('ratings')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductRating = async (productId: string, ratingId: string) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('ratings')
    .doc(ratingId)
    .get()
    .then((res): any => ({ id: res.id, ...res.data() }))
}

export const getProductRatingsByUserId = async (productId: string, userId: string) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('ratings')
    .where('user_id', '==', userId)
    .limit(1)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductRatingByOrderId = async (productId: string, order_id: string) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('ratings')
    .where('order_id', '==', order_id)
    .limit(1)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createProductRating = async (id: string, data: any) => {
  return await db
    .collection('products')
    .doc(id)
    .collection('ratings')
    .add(data)
    .then((res) => {
      return res.get()
    })
    .then((doc): any => ({ id: doc.id, ...doc.data(), created_at: new Date() }))
}

export const updateProductRating = async (productId: string, ratingId: string, value: number) => {
  return await db
    .collection('products')
    .doc(productId)
    .collection('ratings')
    .doc(ratingId)
    .update({ value, updated_at: new Date() })
}

export const deleteProductRating = async (productId: string, ratingId: string) => {
  return await db.collection('products').doc(productId).collection('ratings').doc(ratingId).delete()
}

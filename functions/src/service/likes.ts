import * as admin from 'firebase-admin'
import db from '../utils/db'

const firebaseDb = admin.firestore()

export const getLikesByUser = async (user_id: string, entity_name?: string) => {
  let result = firebaseDb.collectionGroup('likes').where('user_id', '==', user_id)
  if (entity_name) result = result.where('parent_collection_name', '==', entity_name)
  return result.get().then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductLike = async (product_id: string, user_id: string) => {
  const like = await db
    .getLikes(`products/${product_id}/likes`)
    .doc(`${product_id}_${user_id}_like`)
    .get()
  return like.data()
}

export const getProductLikes = async (product_id: string) => {
  const like = await db.getLikes(`products/${product_id}/likes`).get()
  return like.docs.map((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const addProductLike = async (product_id: string, user_id: string, data: any = {}) => {
  const likeRef = db.getLikes(`products/${product_id}/likes`).doc(`${product_id}_${user_id}_like`)
  return await likeRef.set({
    ...data,
    user_id,
    product_id,
    created_at: new Date(),
  })
}

export const removeProductLike = async (product_id: string, user_id: string) => {
  return await db
    .getLikes(`products/${product_id}/likes`)
    .doc(`${product_id}_${user_id}_like`)
    .delete()
}

export const getShopLike = async (shop_id: string, user_id: string) => {
  const like = await db.getLikes(`shops/${shop_id}/likes`).doc(`${shop_id}_${user_id}_like`).get()
  return like.data()
}

export const addShopLike = async (shop_id: string, user_id: string, data: any = {}) => {
  const likeRef = db.getLikes(`shops/${shop_id}/likes`).doc(`${shop_id}_${user_id}_like`)
  return await likeRef.set({
    ...data,
    user_id,
    shop_id,
    created_at: new Date(),
  })
}

export const removeShopLike = async (shop_id: string, user_id: string) => {
  return await db.getLikes(`shops/${shop_id}/likes`).doc(`${shop_id}_${user_id}_like`).delete()
}

export const getActivityLike = async (activity_id: string, user_id: string) => {
  const like = await db
    .getLikes(`activities/${activity_id}/likes`)
    .doc(`${activity_id}_${user_id}_like`)
    .get()
  return like.data()
}

export const addActivityLike = async (activity_id: string, user_id: string) => {
  const likeRef = db
    .getLikes(`activities/${activity_id}/likes`)
    .doc(`${activity_id}_${user_id}_like`)
  return await likeRef.set({
    parent_collection_path: 'activities',
    parent_collection_name: 'activities',
    user_id,
    activity_id,
    created_at: new Date(),
  } as any)
}

export const removeActivityLike = async (activity_id: string, user_id: string) => {
  return await db
    .getLikes(`activities/${activity_id}/likes`)
    .doc(`${activity_id}_${user_id}_like`)
    .delete()
}

// no other way around this except adding the comment_id as field inside "comments" collectionGroup
export const addCommentLike = async (activity_id: string, comment_id: string, user_id: string) => {
  const likeRef = await db
    .getLikes(`activities/${activity_id}/comments/${comment_id}/comment_likes`)
    .doc(`${comment_id}_${user_id}_like`)

  return await likeRef.set({
    parent_collection_path: `activities/${activity_id}/comments`,
    parent_collection_name: 'comments',
    user_id,
    comment_id,
    created_at: new Date(),
  } as any)
}

// alternatively, we can add the "id" of comment_likes to its field to access the document through collectionGroup
export const removeCommentLike = async (
  activity_id: string,
  comment_id: string,
  user_id: string
) => {
  return await db
    .getLikes(`activities/${activity_id}/comments/${comment_id}/comment_likes`)
    .doc(`${comment_id}_${user_id}_like`)
    .delete()
}

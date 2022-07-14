import { getDocs, query, where } from 'firebase/firestore'
import { LikeCreateData } from '../models/Like'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const addProductLike = (productId: string, userId: string, data: LikeCreateData) => {
  return createBaseMethods(db.getLikes(`products/${productId}/likes`)).createById(
    `${productId}_${userId}_like`,
    {
      ...data,
      parent_collection_path: 'products',
      parent_collection_name: 'products',
    }
  )
}

export const removeProductLike = (productId: string, userId: string) => {
  return createBaseMethods(db.getLikes(`products/${productId}/likes`)).remove(
    `${productId}_${userId}_like`
  )
}

export const findProductLikesByUser = async (userId: string) => {
  const wishlistsQuery = query(
    db.likes,
    where('user_id', '==', userId),
    where('parent_collection_name', '==', 'products')
  )
  const snapshot = await getDocs(wishlistsQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findProductLike = async (productId: string, userId: string) => {
  return createBaseMethods(db.getLikes(`products/${productId}/likes`)).findById(
    `${productId}_${userId}_like`
  )
}

export const findAllProductLikes = async (productId: string) => {
  return createBaseMethods(db.getLikes(`products/${productId}/likes`)).findAll()
}

export const addShopLike = (shopId: string, userId: string, data: LikeCreateData) => {
  return createBaseMethods(db.getLikes(`shops/${shopId}/likes`)).createById(
    `${shopId}_${userId}_like`,
    {
      ...data,
      parent_collection_path: 'shops',
      parent_collection_name: 'shops',
    }
  )
}

export const removeShopLike = (shopId: string, userId: string) => {
  return createBaseMethods(db.getLikes(`shops/${shopId}/likes`)).remove(
    `${shopId}_${userId}_like`
  )
}

export const findShopLikesByUser = async (userId: string) => {
  const wishlistsQuery = query(
    db.likes,
    where('user_id', '==', userId),
    where('parent_collection_name', '==', 'shops')
  )
  const snapshot = await getDocs(wishlistsQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findShopLike = async (shopId: string, userId: string) => {
  return createBaseMethods(db.getLikes(`shops/${shopId}/likes`)).findById(
    `${shopId}_${userId}_like`
  )
}

export const findAllShopLikes = async (shopId: string) => {
  return createBaseMethods(db.getLikes(`shops/${shopId}/likes`)).findAll()
}

export const addActivityLike = (activityId: string, userId: string, data: LikeCreateData) => {
  return createBaseMethods(db.getLikes(`activities/${activityId}/likes`)).createById(
    `${activityId}_${userId}_like`,
    {
      ...data,
      parent_collection_path: 'activities',
      parent_collection_name: 'activities',
    }
  )
}

export const removeActivityLike = (activityId: string, userId: string) => {
  return createBaseMethods(db.getLikes(`activities/${activityId}/likes`)).remove(
    `${activityId}_${userId}_like`
  )
}

export const findActivityLikesByUser = async (userId: string) => {
  const wishlistsQuery = query(
    db.likes,
    where('user_id', '==', userId),
    where('parent_collection_name', '==', 'activities')
  )
  const snapshot = await getDocs(wishlistsQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findActivityLike = async (activityId: string, userId: string) => {
  return createBaseMethods(db.getLikes(`activities/${activityId}/likes`)).findById(
    `${activityId}_${userId}_like`
  )
}

export const findAllActivityLikes = async (activityId: string) => {
  return createBaseMethods(db.getLikes(`activities/${activityId}/likes`)).findAll()
}

export const addCommentLike = (activityId: string, commentId: string, userId: string) => {
  return createBaseMethods(
    db.getLikes(`activities/${activityId}/comments/${commentId}/likes`)
  ).createById(`${commentId}_${userId}_like`, {
    userId,
    commentId,
    parent_collection_path: `activities/${activityId}/comments`,
    parent_collection_name: `activities/${activityId}/comments`,
  })
}

export const removeCommentLike = (activityId: string, commentId: string, userId: string) => {
  return createBaseMethods(
    db.getLikes(`activities/${activityId}/comments/${commentId}/likes`)
  ).remove(`${commentId}_${userId}_like`)
}

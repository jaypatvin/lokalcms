import { getDocs, query, where } from 'firebase/firestore'
import { WishlistCreateData } from '../models/Wishlist'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const create = (productId: string, userId: string, data: WishlistCreateData) => {
  return createBaseMethods(db.getProductWishlists(`products/${productId}/wishlists`)).createById(
    `${productId}_${userId}_wishlist`,
    data
  )
}

export const findWishlistsByUser = async (userId: string) => {
  const wishlistsQuery = query(db.wishlists, where('user_id', '==', userId))
  const snapshot = await getDocs(wishlistsQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findWishlistsByShop = async (shopId: string) => {
  const wishlistsQuery = query(db.wishlists, where('shop_id', '==', shopId))
  const snapshot = await getDocs(wishlistsQuery)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}

export const findProductWishlist = async (productId: string, userId: string) => {
  return createBaseMethods(db.getProductWishlists(`products/${productId}/wishlists`)).findById(
    `${productId}_${userId}_wishlist`
  )
}

export const findAllProductWishlists = async (productId: string) => {
  return createBaseMethods(db.getProductWishlists(`products/${productId}/wishlists`)).findAll()
}

export const remove = (productId: string, userId: string) => {
  return createBaseMethods(db.getProductWishlists(`products/${productId}/wishlists`)).remove(
    `${productId}_${userId}_wishlist`
  )
}

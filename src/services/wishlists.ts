import { db } from './firebase'

type GetWishlistsByUserParamTypes = {
  userId: string
  limit?: number
}

type GetWishlistsByProductParamTypes = {
  productId: string
  limit?: number
}

export const getWishlistsByProduct = ({ productId, limit = 10 }: GetWishlistsByProductParamTypes) => {
  return db
    .collection('products')
    .doc(productId)
    .collection('wishlists')
    .limit(limit)
}

export const getWishlistsByUser = ({
  userId,
  limit = 10,
}: GetWishlistsByUserParamTypes) => {
  return db
    .collectionGroup('wishlists')
    .where('user_id', '==', userId)
    .limit(limit)
}

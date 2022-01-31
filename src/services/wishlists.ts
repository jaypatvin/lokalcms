import { db } from '../utils'

type GetWishlistsByUserParamTypes = {
  userId: string
  limit?: number
}

type GetWishlistsByProductParamTypes = {
  productId: string
  limit?: number
}

export const getWishlistsByProduct = ({
  productId,
  limit = 10,
}: GetWishlistsByProductParamTypes) => {
  return db.getProductWishlists(`products/${productId}/wishlists`).limit(limit)
}

export const getWishlistsByUser = ({ userId, limit = 10 }: GetWishlistsByUserParamTypes) => {
  return db.wishlists.where('user_id', '==', userId).limit(limit)
}

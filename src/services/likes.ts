import { db } from '../utils'
import { db as firestoreDb } from './firebase'

type GetLikesByUserParamTypes = {
  userId: string
  entityName: 'products' | 'shops' | 'activities'
  limit?: number
}

type GetLikesByShopParamTypes = {
  shopId: string
  limit?: number
}

export const getLikesByShop = ({ shopId, limit = 10 }: GetLikesByShopParamTypes) => {
  return db.getLikes(`shops/${shopId}/likes`).orderBy('created_at', 'desc').limit(limit)
}

export const getLikesByUser = ({
  userId,
  entityName = 'products',
  limit = 10,
}: GetLikesByUserParamTypes) => {
  return firestoreDb
    .collectionGroup('likes')
    .where('user_id', '==', userId)
    .where('parent_collection_name', '==', entityName)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

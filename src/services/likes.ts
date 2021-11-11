import { db } from './firebase'

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
  return db
    .collectionGroup('likes')
    .where('shop_id', '==', shopId)
    .where('parent_collection_name', '==', 'shops')
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const getLikesByUser = ({
  userId,
  entityName = 'products',
  limit = 10,
}: GetLikesByUserParamTypes) => {
  return db
    .collectionGroup('likes')
    .where('user_id', '==', userId)
    .where('parent_collection_name', '==', entityName)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

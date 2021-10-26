import { db } from './firebase'

type ParamTypes = {
  userId: string
  entityName: 'products' | 'shops' | 'activities'
  limit?: number
}

export const getLikesByUser = ({ userId, entityName = 'products', limit = 10 }: ParamTypes) => {
  return db
    .collectionGroup('likes')
    .where('user_id', '==', userId)
    .where('parent_collection_name', '==', entityName)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

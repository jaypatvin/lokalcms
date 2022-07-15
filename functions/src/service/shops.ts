import {
  doc,
  documentId,
  increment,
  orderBy as firestoreOrderBy,
  OrderByDirection,
  QueryConstraint,
  updateDoc,
  where,
} from 'firebase/firestore'
import { ShopCreateData, ShopUpdateData } from '../models/Shop'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.shops)

export { findAll, findByCommunityId, findById }

export const create = (data: ShopCreateData) => baseCreate(data)
export const update = (id: string, data: ShopUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: ShopUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: ShopUpdateData) => baseUnarchive(id, data)

export const findShopsByUserId = async (id: string) => {
  return await findAll({
    wheres: [where('user_id', '==', id)],
  })
}

export const findShopsByCommunityId = async (id: string) => {
  return await findAll({
    wheres: [where('community_id', '==', id)],
  })
}

export const findCommunityShopsWithFilter = async ({
  community_id,
  wheres = [],
  orderBy,
  sortOrder = 'asc',
}: {
  community_id: string
  wheres?: QueryConstraint[]
  orderBy?: string
  sortOrder?: OrderByDirection
}) => {
  const otherWheres = wheres.map((w) => {
    let key = w[0] === 'id' ? documentId() : w[0]
    return where(key, w[1], w[2])
  })
  return await findAll({
    wheres: [
      where('community_id', '==', community_id),
      where('archived', '==', false),
      ...otherWheres,
      ...(orderBy ? [firestoreOrderBy(orderBy, sortOrder)] : []),
    ],
  })
}

export const findCustomAvailableShopsByDate = async (date: string) => {
  return await findAll({
    wheres: [firestoreOrderBy(`operating_hours.schedule.custom.${date}.start_time`)],
  })
}

export const findCustomUnavailableShopsByDate = async (date: string) => {
  return await findAll({
    wheres: [firestoreOrderBy(`operating_hours.schedule.custom.${date}.unavailable`)],
  })
}

export const searchShops = async ({
  search,
  community_id,
}: {
  search: string
  community_id: string
}) => {
  return await findAll({
    wheres: [
      where('keywords', 'array-contains', search),
      where('community_id', '==', community_id),
    ],
  })
}

export const incrementShopLikeCount = async (id: string) => {
  const docRef = doc(db.shops, id)
  return await updateDoc(docRef, {
    '_meta.likes_count': increment(1),
  })
}

export const decrementShopLikeCount = async (id: string) => {
  const docRef = doc(db.shops, id)
  return await updateDoc(docRef, {
    '_meta.likes_count': increment(-1),
  })
}

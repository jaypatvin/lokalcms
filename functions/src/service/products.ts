import {
  documentId,
  OrderByDirection,
  QueryConstraint,
  where,
  orderBy as firestoreOrderBy,
  doc,
  updateDoc,
  increment,
} from 'firebase/firestore'
import { ProductCreateData, ProductUpdateData } from '../models/Product'
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
} = createBaseMethods(db.products)

export { findAll, findByCommunityId, findById }

export const create = (data: ProductCreateData) => baseCreate(data)
export const update = (id: string, data: ProductUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: ProductUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: ProductUpdateData) => baseUnarchive(id, data)

export const findProductsByUserId = async (id: string) => {
  return await findAll({
    wheres: [where('user_id', '==', id)],
  })
}

export const findProductsByCommunityId = async (id: string) => {
  return await findAll({
    wheres: [where('community_id', '==', id)],
  })
}

export const findProductsByShopId = async (id: string) => {
  return await findAll({
    wheres: [where('shop_id', '==', id)],
  })
}

export const findCommunityProductsWithFilter = async ({
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

export const findCustomAvailableProductsByDate = async (date: string) => {
  return await findAll({
    wheres: [firestoreOrderBy(`availability.schedule.custom.${date}.start_time`)],
  })
}

export const findCustomUnavailableProductsByDate = async (date: string) => {
  return await findAll({
    wheres: [firestoreOrderBy(`availability.schedule.custom.${date}.unavailable`)],
  })
}

export const incrementProductLikeCount = async (id: string) => {
  const docRef = doc(db.products, id)
  return await updateDoc(docRef, {
    '_meta.likes_count': increment(1),
  })
}

export const decrementProductLikeCount = async (id: string) => {
  const docRef = doc(db.products, id)
  return await updateDoc(docRef, {
    '_meta.likes_count': increment(-1),
  })
}

export const incrementProductQuantity = async (id: string, amount: number) => {
  const docRef = doc(db.products, id)
  return await updateDoc(docRef, {
    quantity: increment(amount),
  })
}

export const decrementProductQuantity = async (id: string, amount: number) => {
  const docRef = doc(db.products, id)
  return await updateDoc(docRef, {
    quantity: increment(amount),
  })
}

export const incrementProductWishlistCount = async (id: string) => {
  const docRef = doc(db.products, id)
  return await updateDoc(docRef, {
    '_meta.wishlists_count': increment(1),
  })
}

export const decrementProductWishlistCount = async (id: string) => {
  const docRef = doc(db.products, id)
  return await updateDoc(docRef, {
    '_meta.wishlists_count': increment(-1),
  })
}

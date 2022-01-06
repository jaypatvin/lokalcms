import * as admin from 'firebase-admin'
import { ShopCreateData, ShopUpdateData } from '../models/Shop'
import db from '../utils/db'

const firestoreDb = admin.firestore()

export const getShopsByUserID = async (id: string) => {
  return await db.shops
    .where('user_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getShopsByCommunityID = async (id: string) => {
  return await db.shops
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getCommunityShopsWithFilter = async ({
  community_id,
  wheres = [],
  orderBy,
  sortOrder = 'asc',
}: {
  community_id: string
  wheres?: [string, FirebaseFirestore.WhereFilterOp, unknown][]
  orderBy?: string
  sortOrder?: FirebaseFirestore.OrderByDirection
}) => {
  let res = db.shops.where('community_id', '==', community_id).where('archived', '==', false)
  wheres.forEach((where) => {
    let key = where[0] === 'id' ? admin.firestore.FieldPath.documentId() : where[0]
    res = res.where(key, where[1], where[2])
  })

  if (orderBy) {
    res = res.orderBy(orderBy, sortOrder)
  }

  return await res.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getCustomAvailableShopsByDate = async (date: string) => {
  let res = db.shops.orderBy(`operating_hours.schedule.custom.${date}.start_time`)

  return await res.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getCustomUnavailableShopsByDate = async (date: string) => {
  let res = db.shops.orderBy(`operating_hours.schedule.custom.${date}.unavailable`)

  return await res.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getShopByID = async (id: string) => {
  const shop = await db.shops.doc(id).get()

  const data = shop.data()
  if (data) return { id: shop.id, ...data }
  return null
}

export const createShop = async (data: ShopCreateData) => {
  return await db.shops
    .add({ ...data, created_at: FirebaseFirestore.Timestamp.now() })
    .then((res) => res.get())
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

export const updateShop = async (id: string, data: ShopUpdateData) => {
  return await db.shops.doc(id).update({ ...data, updated_at: FirebaseFirestore.Timestamp.now() })
}

export const archiveShop = async (id: string, data?: ShopUpdateData) => {
  let updateData = {
    archived: true,
    archived_at: FirebaseFirestore.Timestamp.now(),
    updated_at: FirebaseFirestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.shops.doc(id).update(updateData)
}

export const unarchiveShop = async (id: string, data?: ShopUpdateData) => {
  let updateData = { archived: false, updated_at: FirebaseFirestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.shops.doc(id).update(updateData)
}

export const archiveUserShops = async (user_id: string, data?: ShopUpdateData) => {
  let updateData = {
    archived: true,
    archived_at: FirebaseFirestore.Timestamp.now(),
    updated_at: FirebaseFirestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  const shopsRef = await db.shops.where('user_id', '==', user_id).get()

  const batch = firestoreDb.batch()
  shopsRef.forEach((shop) => {
    const shopRef = shop.ref
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const unarchiveUserShops = async (user_id: string) => {
  const shopsRef = await db.shops.where('user_id', '==', user_id).get()

  const batch = firestoreDb.batch()
  shopsRef.forEach((shop) => {
    const shopRef = shop.ref
    const updateData: any = {
      archived: false,
      updated_at: FirebaseFirestore.Timestamp.now(),
    }
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const searchShops = async ({ search, community_id }) => {
  let ref: admin.firestore.Query<admin.firestore.DocumentData> = db.shops
  if (search) ref = ref.where('keywords', 'array-contains', search)
  if (community_id) ref = ref.where('community_id', '==', community_id)
  return await ref.get()
}

export const incrementShopLikeCount = async (id: string) => {
  return await db.shops.doc(id).update({
    '_meta.likes_count': admin.firestore.FieldValue.increment(1),
  })
}

export const decrementShopLikeCount = async (id: string) => {
  return await db.shops.doc(id).update({
    '_meta.likes_count': admin.firestore.FieldValue.increment(-1),
  })
}

import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'shops'

export const getShopsByUserID = async (id: string) => {
  return await db
    .collection(collectionName)
    .where('user_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getShopsByCommunityID = async (id: string) => {
  return await db
    .collection(collectionName)
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCommunityShopsWithFilter = async ({
  community_id,
  wheres = [],
  orderBy,
  sortOrder = 'asc',
}: {
  community_id: string
  wheres?: [string, FirebaseFirestore.WhereFilterOp, any][]
  orderBy?: string
  sortOrder?: FirebaseFirestore.OrderByDirection
}) => {
  let res = db
    .collection(collectionName)
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
  wheres.forEach((where) => {
    let key = where[0] === 'id' ? admin.firestore.FieldPath.documentId() : where[0]
    res = res.where(key, where[1], where[2])
  })

  if (orderBy) {
    res = res.orderBy(orderBy, sortOrder)
  }

  return await res.get().then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCustomAvailableShopsByDate = async (date: string) => {
  let res = db
    .collection(collectionName)
    .orderBy(`operating_hours.schedule.custom.${date}.start_time`)

  return await res.get().then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCustomUnavailableShopsByDate = async (date: string) => {
  let res = db
    .collection(collectionName)
    .orderBy(`operating_hours.schedule.custom.${date}.unavailable`)

  return await res.get().then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getShopByID = async (id: string) => {
  const shop = await db.collection(collectionName).doc(id).get()

  const data = shop.data()
  if (data) return { id: shop.id, ...data } as any
  return data
}

export const createShop = async (data) => {
  return await db
    .collection(collectionName)
    .add({ ...data, created_at: new Date() })
    .then((res) => res.get())
    .then((doc): any => ({ id: doc.id, ...doc.data() }))
}

export const updateShop = async (id: string, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveShop = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection(collectionName).doc(id).update(updateData)
}

export const unarchiveShop = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection(collectionName).doc(id).update(updateData)
}

export const archiveUserShops = async (user_id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  const shopsRef = await db.collection(collectionName).where('user_id', '==', user_id).get()

  const batch = db.batch()
  shopsRef.forEach((shop) => {
    const shopRef = shop.ref
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const unarchiveUserShops = async (user_id: string) => {
  const shopsRef = await db.collection(collectionName).where('user_id', '==', user_id).get()

  const batch = db.batch()
  shopsRef.forEach((shop) => {
    const shopRef = shop.ref
    const updateData: any = {
      archived: false,
      updated_at: new Date(),
    }
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const searchShops = async ({ search, community_id }) => {
  let ref: admin.firestore.Query<admin.firestore.DocumentData> = db.collection(collectionName)
  if (search) ref = ref.where('keywords', 'array-contains', search)
  if (community_id) ref = ref.where('community_id', '==', community_id)
  return await ref.get()
}

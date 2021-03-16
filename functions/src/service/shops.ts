import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getShopsByUserID = async (id: string) => {
  return await db
    .collection('shops')
    .where('user_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getShopsByCommunityID = async (id: string) => {
  return await db
    .collection('shops')
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getShopByID = async (id: string) => {
  const shop = await db.collection('shops').doc(id).get()

  const data = shop.data()
  if (data) return { id: shop.id, ...data } as any
  return data
}

export const createShop = async (data) => {
  return await db
    .collection('shops')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateShop = async (id: string, data) => {
  return await db
    .collection('shops')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveShop = async (id: string) => {
  return await db
    .collection('shops')
    .doc(id)
    .update({ archived: true, archived_at: new Date(), updated_at: new Date() })
}

export const unarchiveShop = async (id: string) => {
  return await db.collection('shops').doc(id).update({ archived: false, updated_at: new Date() })
}

export const archiveUserShops = async (user_id: string) => {
  const shopsRef = await db.collection('shops').where('user_id', '==', user_id).get()

  const batch = db.batch()
  shopsRef.forEach((shop) => {
    const shopRef = shop.ref
    const updateData: any = {
      archived: true,
      archived_at: new Date(),
      updated_at: new Date(),
    }
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const unarchiveUserShops = async (user_id: string) => {
  const shopsRef = await db.collection('shops').where('user_id', '==', user_id).get()

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

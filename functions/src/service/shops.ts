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
  return await db
    .collection('shops')
    .doc(id)
    .get()
    .then((res) => {
      return res.data()
    })
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

export const setShopsStatusOfUser = async (
  id,
  status: 'previous' | 'enabled' | 'disabled' | 'archived'
) => {
  const shopsRef = await db.collection('shops').where('user_id', '==', id).get()

  const batch = db.batch()
  shopsRef.forEach((shop) => {
    const shopRef = shop.ref
    const shopData = shop.data()
    const new_status = status === 'previous' ? shopData.previous_status || 'enabled' : status
    const updateData: any = {
      status: new_status,
      previous_status: shopData.status,
      updated_at: new Date(),
    }
    if (status === 'archived') updateData.archived_at = new Date()
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

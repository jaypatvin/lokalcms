import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getShopsByUserID = async (id) => {
    return await db
                  .collection('shops')
                  .where('user_id', '==', id)
                  .get()
                  .then(res => res.docs.map(doc => doc.data()))
}

export const getShopsByCommunityID = async (id) => {
    return await db
                  .collection('shops')
                  .where('community_id', '==', id)
                  .get()
                  .then(res => res.docs.map(doc => doc.data()))
}

export const getShopByID = async (id) => {
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
                  .add(data)
                  .then((res) => {
                    return res
                  })
}

export const setShopsStatusOfUser = async (id, status: 'previous' | 'enabled' | 'disabled' | 'archived') => {

  const shopsRef = await db
                  .collection('shops')
                  .where('user_id', '==', id)
                  .get()

  const batch = db.batch()
  shopsRef.forEach(shop => {
    const shopRef = shop.ref
    const shopData = shop.data()
    const new_status = status === 'previous' ? (shopData.previous_status || 'enabled') : status
    const updateData: any = {
      status: new_status,
      previous_status: shopData.status
    }
    if (status === 'archived') updateData.archived_at = new Date()
    batch.update(shopRef, updateData)
  })
  const result = await batch.commit()
  return result
}

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
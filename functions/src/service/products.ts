import * as admin from 'firebase-admin'

const db = admin.firestore()

const getProductsBy = async (idType, id) => {
  return await db
    .collection('products')
    .where(idType, '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductsByShopID = async (id) => await getProductsBy('shop_id', id)

export const getProductsByUserId = async (id) => await getProductsBy('user_id', id)

export const getProductsByCommunityID = async (id) => await getProductsBy('community_id', id)

export const getProductByID = async (id) => {
  return await db
    .collection('products')
    .doc(id)
    .get()
    .then((res) => {
      return res.data()
    })
}

export const createProduct = async (data) => {
  return await db
    .collection('products')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateProduct = async (id, data) => {
  return await db
    .collection('products')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

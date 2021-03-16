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
  const product = await db.collection('products').doc(id).get()

  const data = product.data()
  if (data) return { id: product.id, ...data } as any
  return data
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

export const archiveProduct = async (id: string) => {
  return await db
    .collection('products')
    .doc(id)
    .update({ archived: true, archived_at: new Date(), updated_at: new Date() })
}

export const unarchiveProduct = async (id: string) => {
  return await db.collection('products').doc(id).update({ archived: false, updated_at: new Date() })
}

export const archiveUserProducts = async (user_id: string) => {
  const productsRef = await db.collection('products').where('user_id', '==', user_id).get()

  const batch = db.batch()
  productsRef.forEach((product) => {
    const productRef = product.ref
    const updateData: any = {
      archived: true,
      archived_at: new Date(),
      updated_at: new Date(),
    }
    batch.update(productRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const unarchiveUserProducts = async (user_id: string) => {
  const productsRef = await db.collection('products').where('user_id', '==', user_id).get()

  const batch = db.batch()
  productsRef.forEach((product) => {
    const productRef = product.ref
    const updateData: any = {
      archived: false,
      updated_at: new Date(),
    }
    batch.update(productRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const archiveShopProducts = async (shop_id: string) => {
  const productsRef = await db.collection('products').where('shop_id', '==', shop_id).get()

  const batch = db.batch()
  productsRef.forEach((product) => {
    const productRef = product.ref
    const updateData: any = {
      archived: true,
      archived_at: new Date(),
      updated_at: new Date(),
    }
    batch.update(productRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const unarchiveShopProducts = async (shop_id: string) => {
  const productsRef = await db.collection('products').where('shop_id', '==', shop_id).get()

  const batch = db.batch()
  productsRef.forEach((product) => {
    const productRef = product.ref
    const updateData: any = {
      archived: false,
      updated_at: new Date(),
    }
    batch.update(productRef, updateData)
  })
  const result = await batch.commit()
  return result
}

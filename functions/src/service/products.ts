import * as admin from 'firebase-admin'

const db = admin.firestore()

const getProductsBy = async (idType, id) => {
  return await db
    .collection('products')
    .where(idType, '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCommunityProductsWithFilter = async ({
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
    .collection('products')
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
  wheres.forEach((where) => {
    res = res.where(where[0], where[1], where[2])
  })

  if (orderBy) {
    res = res.orderBy(orderBy, sortOrder)
  }

  return await res.get().then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
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

export const archiveProduct = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection('products').doc(id).update(updateData)
}

export const unarchiveProduct = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection('products').doc(id).update(updateData)
}

export const archiveUserProducts = async (user_id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  const productsRef = await db.collection('products').where('user_id', '==', user_id).get()

  const batch = db.batch()
  productsRef.forEach((product) => {
    const productRef = product.ref
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

export const searchProducts = async ({ search, category, community_id }) => {
  let ref: admin.firestore.Query<admin.firestore.DocumentData> = db.collection('products')
  if (search) ref = ref.where('keywords', 'array-contains', search)
  if (category) ref = ref.where('product_category', '==', category)
  if (community_id) ref = ref.where('community_id', '==', community_id)
  return await ref.get()
}

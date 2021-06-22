import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getOrders = () => {
  return db
    .collection('orders')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getOrderByID = async (id) => {
  const doc = await db.collection('orders').doc(id).get()

  const data = doc.data()
  if (data) return { id: doc.id, ...data }
  return data
}

export const getOrdersByCommunityId = async (id: string) => {
  return await db
    .collection('orders')
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createOrder = async (data) => {
  return await db
    .collection('orders')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateOrder = async (id, data) => {
  return await db
    .collection('orders')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

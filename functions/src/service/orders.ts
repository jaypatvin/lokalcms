import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'orders'

export const getOrders = () => {
  return db
    .collection(collectionName)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getOrderByID = async (id) => {
  const doc = await db.collection(collectionName).doc(id).get()

  const data = doc.data()
  if (data) return { id: doc.id, ...data }
  return data
}

export const getOrdersByCommunityId = async (id: string) => {
  return await db
    .collection(collectionName)
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getOrdersByBuyerId = async (id: string) => {
  return await db
    .collection(collectionName)
    .where('buyer_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getOrdersByProductSubscriptionIdAndDate = async (id: string, date: string) => {
  return await db
    .collection(collectionName)
    .where('product_subscription_id', '==', id)
    .where('product_subscription_date', '==', date)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createOrder = async (data) => {
  return await db
    .collection(collectionName)
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateOrder = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const createOrderStatusHistory = async (order_id, data) => {
  return await db
    .collection(collectionName)
    .doc(order_id)
    .collection('status_history')
    .add({ ...data, updated_at: new Date() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => doc.data())
}

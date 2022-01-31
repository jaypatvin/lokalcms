import { firestore } from 'firebase-admin'
import { OrderCreateData, OrderUpdateData } from '../models/Order'
import db from '../utils/db'

export const getOrders = () => {
  return db.orders.get().then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getOrderByID = async (id) => {
  const doc = await db.orders.doc(id).get()

  const data = doc.data()
  if (data) return { id: doc.id, ...data }
  return null
}

export const getOrdersByCommunityId = async (id: string) => {
  return await db.orders
    .where('community_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getOrdersByBuyerId = async (id: string) => {
  return await db.orders
    .where('buyer_id', '==', id)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getOrdersByProductSubscriptionIdAndDate = async (id: string, date: string) => {
  return await db.orders
    .where('product_subscription_id', '==', id)
    .where('product_subscription_date', '==', date)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createOrder = async (data: OrderCreateData) => {
  return await db.orders.add({ ...data, created_at: firestore.Timestamp.now() }).then((res) => {
    return res
  })
}

export const updateOrder = async (id: string, data: OrderUpdateData) => {
  return await db.orders.doc(id).update({ ...data, updated_at: new Date() })
}

export const createOrderStatusHistory = async (order_id, data) => {
  return await db.orders
    .doc(order_id)
    .collection('status_history')
    .add({ ...data, updated_at: new Date() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => doc.data())
}

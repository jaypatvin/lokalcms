import { db } from './firebase'

export const fetchOrderStatusByID = async (id: string) => {
  return db.collection('order_status').doc(id).get()
}

export const getOrderStatuses = () => {
  return db.collection('order_status')
}

import { db } from '../utils'

export const fetchOrderStatusByID = async (id: string) => {
  return db.orderStatus.doc(id).get()
}

export const getOrderStatuses = () => {
  return db.orderStatus
}

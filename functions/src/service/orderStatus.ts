import db from '../utils/db'

export const getAllOrderStatus = async () => {
  return await db.orderStatus
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getOrderStatusById = async (id) => {
  const status = await db.orderStatus.doc(id).get()

  const data = status.data()
  if (data) return { id: status.id, ...data } as any
  return data
}

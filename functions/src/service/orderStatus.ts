import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllOrderStatus = async () => {
  return await db
    .collection('order_status')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getOrderStatusById = async (id) => {
  const status = await db.collection('order_status').doc(id).get()

  const data = status.data()
  if (data) return { id: status.id, ...data } as any
  return data
}

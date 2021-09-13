import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'product_subscriptions'

export const getAllProductSubscriptions = async () => {
  return await db
    .collection(collectionName)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionById = async (id) => {
  const product_subscription = await db.collection(collectionName).doc(id).get()

  const data = product_subscription.data()
  if (data) return { id: product_subscription.id, ...data } as any
  return data
}

export const getProductSubscriptionsByDate = async (dateString: string) => {
  return await db
    .collection(collectionName)
    .where('date_string', '==', dateString)
    .where('skip', '==', false)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionByDateAndPlanId = async (planId: string, dateString: string) => {
  return await db
    .collection(collectionName)
    .where('product_subscription_plan_id', '==', planId)
    .where('date_string', '==', dateString)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createProductSubscription = async (data) => {
  return await db
    .collection(collectionName)
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateProductSubscription = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const archiveProductSubscription = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const unarchiveProductSubscription = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

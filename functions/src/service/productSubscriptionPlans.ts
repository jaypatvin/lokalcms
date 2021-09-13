import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'product_subscription_plans'

export const getAllSubscriptionPlans = async () => {
  return await db
    .collection(collectionName)
    .where('status', '==', 'enabled')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionPlanById = async (id) => {
  const plan = await db.collection(collectionName).doc(id).get()

  const data = plan.data()
  if (data) return { id: plan.id, ...data } as any
  return data
}

export const createProductSubscriptionPlan = async (data) => {
  return await db
    .collection(collectionName)
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateProductSubscriptionPlan = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date() })
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const archiveProductSubscriptionPlan = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const unarchiveProductSubscriptionPlan = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
    .then(() => db.collection(collectionName).doc(id).get())
    .then((doc): any => ({ ...doc.data(), id: doc.id }))
}

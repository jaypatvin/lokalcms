import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllSubscriptionPlans = async () => {
  return await db
    .collection('product_subscription_plans')
    .where('status', '==', 'enabled')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionPlanById = async (id) => {
  const plan = await db.collection('product_subscription_plans').doc(id).get()

  const data = plan.data()
  if (data) return { id: plan.id, ...data } as any
  return data
}

export const createProductSubscriptionPlan = async (data) => {
  return await db
    .collection('product_subscription_plans')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

export const updateProductSubscriptionPlan = async (id, data) => {
  return await db
    .collection('product_subscription_plans')
    .doc(id)
    .update({ ...data, updated_at: new Date() })
}

export const archiveProductSubscriptionPlan = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection('product_subscription_plans').doc(id).update(updateData)
}

export const unarchiveProductSubscriptionPlan = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.collection('product_subscription_plans').doc(id).update(updateData)
}

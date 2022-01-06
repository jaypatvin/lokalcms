import { ProductSubscriptionCreateData } from '../models/ProductSubscription'
import db from '../utils/db'

export const getAllProductSubscriptions = async () => {
  return await db.productSubscriptions
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionById = async (id: string) => {
  const product_subscription = await db.productSubscriptions.doc(id).get()

  const data = product_subscription.data()
  if (data) return { id: product_subscription.id, ...data }
  return null
}

export const getProductSubscriptionsByDate = async (dateString: string) => {
  return await db.productSubscriptions
    .where('date_string', '==', dateString)
    .where('skip', '==', false)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionByDateAndPlanId = async (planId: string, dateString: string) => {
  return await db.productSubscriptions
    .where('product_subscription_plan_id', '==', planId)
    .where('date_string', '==', dateString)
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const createProductSubscription = async (data: ProductSubscriptionCreateData) => {
  return await db.productSubscriptions
    .add({ ...data, created_at: FirebaseFirestore.Timestamp.now() })
    .then((res) => {
      return res
    })
}

export const updateProductSubscription = async (id, data) => {
  return await db.productSubscriptions
    .doc(id)
    .update({ ...data, updated_at: FirebaseFirestore.Timestamp.now() })
}

export const archiveProductSubscription = async (id: string, data?: any) => {
  let updateData = {
    archived: true,
    archived_at: FirebaseFirestore.Timestamp.now(),
    updated_at: FirebaseFirestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.productSubscriptions.doc(id).update(updateData)
}

export const unarchiveProductSubscription = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: FirebaseFirestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.productSubscriptions.doc(id).update(updateData)
}

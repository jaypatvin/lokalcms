import { firestore } from 'firebase-admin'
import {
  ProductSubscriptionPlanCreateData,
  ProductSubscriptionPlanUpdateData,
} from '../models/ProductSubscriptionPlan'
import db from '../utils/db'

export const getAllSubscriptionPlans = async () => {
  return await db.productSubscriptionPlans
    .where('status', '==', 'enabled')
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getProductSubscriptionPlanById = async (id: string) => {
  const plan = await db.productSubscriptionPlans.doc(id).get()

  const data = plan.data()
  if (data) return { id: plan.id, ...data }
  return null
}

export const createProductSubscriptionPlan = async (data: ProductSubscriptionPlanCreateData) => {
  return await db.productSubscriptionPlans
    .add({ ...data, created_at: firestore.Timestamp.now() })
    .then((res) => {
      return res
    })
}

export const updateProductSubscriptionPlan = async (
  id,
  data: ProductSubscriptionPlanUpdateData
) => {
  return await db.productSubscriptionPlans
    .doc(id)
    .update({ ...data, updated_at: firestore.Timestamp.now() })
}

export const archiveProductSubscriptionPlan = async (
  id: string,
  data?: ProductSubscriptionPlanUpdateData
) => {
  let updateData = {
    archived: true,
    archived_at: firestore.Timestamp.now(),
    updated_at: firestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.productSubscriptionPlans.doc(id).update(updateData)
}

export const unarchiveProductSubscriptionPlan = async (
  id: string,
  data?: ProductSubscriptionPlanUpdateData
) => {
  let updateData = { archived: false, updated_at: firestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.productSubscriptionPlans.doc(id).update(updateData)
}

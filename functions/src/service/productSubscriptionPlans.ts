import { serverTimestamp } from 'firebase/firestore'
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
    .add({ ...data, created_at:serverTimestamp() })
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
    .update({ ...data, updated_at:serverTimestamp() })
}

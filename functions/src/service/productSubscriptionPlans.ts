import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllSubscriptionPlans = async () => {
  return await db
    .collection('product_subscription_plans')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createProductSubscriptionPlan = async (data) => {
  return await db
    .collection('product_subscription_plans')
    .add({ ...data, created_at: new Date() })
    .then((res) => {
      return res
    })
}

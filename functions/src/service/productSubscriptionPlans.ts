import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getAllSubscriptionPlans = async () => {
  return await db
    .collection('product_subscription_plans')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

import * as admin from 'firebase-admin'

const db = admin.firestore()

export const addActivityLike = async (activity_id: string, user_id: string) => {
  const likeRef = db.collection('activities').doc(activity_id).collection('likes').doc(`${activity_id}_${user_id}_like`)
  return await likeRef.set({ user_id, created_at: new Date() })
}

export const removeActivityLike = async (activity_id: string, user_id: string) => {
  return await db.collection('activities').doc(activity_id).collection('likes').doc(`${activity_id}_${user_id}_like`).delete()
}

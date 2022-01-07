import * as admin from 'firebase-admin'
import { ActivityCreateData, ActivityUpdateData } from '../models/Activity'
import db from '../utils/db'

const firestoreDb = admin.firestore()

export const getActivitiesByUserID = async (id: string, userId = '') =>
  await getActivitiesBy('user_id', id, userId)
export const getActivitiesByCommunityID = async (id: string, userId = '') =>
  await getActivitiesBy('community_id', id, userId)

export const getActivityById = async (id: string, userId = '') => {
  const activityRef = db.activities.doc(id)
  const activity = await activityRef.get()
  const images = await activityRef.collection('images').get()

  let liked = false
  if (userId) {
    const likeDoc = await activityRef.collection('likes').doc(`${id}_${userId}_like`).get()
    liked = likeDoc.exists
  }

  const data = activity.data()
  if (data)
    return {
      id: activity.id,
      ...data,
      images: images.docs.map((doc) => {
        return { id: doc.id, ...doc.data() }
      }),
      liked,
    }

  return null
}

export const getAllActivities = async (userId = '') => {
  const activityRef = db.activities
  const activities = await activityRef.orderBy('created_at', 'desc').get()

  return await Promise.all(
    activities.docs.map(async (activityDoc) => {
      const images = await activityRef.doc(activityDoc.id).collection('images').get()
      let liked = false
      if (userId) {
        const likeDoc = await activityRef
          .doc(activityDoc.id)
          .collection('likes')
          .doc(`${activityDoc.id}_${userId}_like`)
          .get()
        liked = likeDoc.exists
      }
      return {
        id: activityDoc.id,
        ...activityDoc.data(),
        images: images.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }
        }),
        liked,
      }
    })
  )
}

// new post, no comments in here
export const createActivity = async (data: ActivityCreateData) => {
  return await db.activities
    .add({ ...data, created_at: admin.firestore.Timestamp.now() })
    .then((res) => res.get())
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

// this does not handle comment activity and does not support update of images
export const updateActivity = async (id: string, data: ActivityUpdateData) => {
  return await db.activities.doc(id).update({
    ...data,
    updated_at: admin.firestore.Timestamp.now(),
    updated_content_at: admin.firestore.Timestamp.now(),
  })
}

export const archiveActivity = async (id: string, data?: ActivityUpdateData) => {
  let updateData = {
    archived: true,
    updated_at: admin.firestore.Timestamp.now(),
    archived_at: admin.firestore.Timestamp.now(),
    unarchived_at: admin.firestore.FieldValue.delete(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.activities.doc(id).update(updateData)
}

export const unarchiveActivity = async (id: string, data?: ActivityUpdateData) => {
  let updateData = {
    archived: false,
    updated_at: admin.firestore.Timestamp.now(),
    archived_at: admin.firestore.FieldValue.delete(),
    unarchived_at: admin.firestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.activities.doc(id).update(updateData)
}

export const archiveUserActivities = async (user_id) =>
  await archiveActivityBy(true, 'user_id', user_id)

export const archiveCommunityActivities = async (community_id) =>
  await archiveActivityBy(true, 'community_id', community_id)

export const unarchiveUserActivities = async (user_id) =>
  await archiveActivityBy(false, 'user_id', user_id)

export const unarchiveCommunityActivities = async (community_id) =>
  await archiveActivityBy(false, 'community_id', community_id)

const getActivitiesBy = async (idType, id, userId = '') => {
  const activityRef = db.activities
  const activities = await db.activities.where(idType, '==', id).orderBy('created_at', 'desc').get()

  return await Promise.all(
    activities.docs.map(async (activityDoc) => {
      const images = await activityRef.doc(activityDoc.id).collection('images').get()
      let liked = false
      if (userId) {
        const likeDoc = await activityRef
          .doc(activityDoc.id)
          .collection('likes')
          .doc(`${activityDoc.id}_${userId}_like`)
          .get()
        liked = likeDoc.exists
      }
      return {
        id: activityDoc.id,
        ...activityDoc.data(),
        images: images.docs.map((doc) => {
          return { id: doc.id, ...doc.data() }
        }),
        liked,
      }
    })
  )
}

const archiveActivityBy = async (status: boolean, idType: string, id: string) => {
  const activitiesRef = await db.activities.where(idType, '==', id).get()

  const batch = firestoreDb.batch()
  activitiesRef.forEach((activity) => {
    const activityRef = activity.ref
    const updateData = {
      archived: status,
      updated_at: admin.firestore.Timestamp.now(),
    }
    batch.update(activityRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const incrementActivityCommentCount = async (id: string) => {
  return await db.activities.doc(id).update({
    '_meta.comment_count': admin.firestore.FieldValue.increment(1),
  })
}

export const deccrementActivityCommentCount = async (id: string) => {
  return await db.activities.doc(id).update({
    '_meta.comment_count': admin.firestore.FieldValue.increment(-1),
  })
}

export const incrementActivityLikeCount = async (id: string) => {
  return await db.activities.doc(id).update({
    '_meta.likes_count': admin.firestore.FieldValue.increment(1),
  })
}

export const deccrementActivityLikeCount = async (id: string) => {
  return await db.activities.doc(id).update({
    '_meta.likes_count': admin.firestore.FieldValue.increment(-1),
  })
}

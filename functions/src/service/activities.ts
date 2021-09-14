import * as admin from 'firebase-admin'

const db = admin.firestore()
const collectionName = 'activities'

export const getActivitiesByUserID = async (id, userId = '') =>
  await getActivitiesBy('user_id', id, userId)
export const getActivitiesByCommunityID = async (id, userId = '') =>
  await getActivitiesBy('community_id', id, userId)

export const getActivityById = async (id, userId = '') => {
  const activityRef = db.collection(collectionName).doc(id)
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
      images: images.docs.map((doc): any => {
        return { id: doc.id, ...doc.data() }
      }),
      liked,
    } as any

  return data
}

export const getAllActivities = async (userId = '') => {
  const activityRef = db.collection(collectionName)
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
        images: images.docs.map((doc): any => {
          return { id: doc.id, ...doc.data() }
        }),
        liked,
      }
    })
  )
}

// new post, no comments in here
export const createActivity = async (data) => {
  const activityRef = db.collection(collectionName).doc()
  const batch = db.batch()

  if (data.images) {
    data.images.forEach((image) => {
      const imageRef = activityRef.collection('images').doc()
      batch.set(imageRef, image)
    })
    delete data.images
  }
  batch.set(activityRef, { ...data, created_at: new Date() })
  await batch.commit()
  return activityRef
}

// this does not handle comment activity and does not support update of images
export const updateActivity = async (id, data) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({ ...data, updated_at: new Date(), updated_content_at: new Date() })
}

export const archiveActivity = async (id: string, data?: any) => {
  let updateData = {
    archived: true,
    updated_at: new Date(),
    archived_at: new Date(),
    unarchived_at: admin.firestore.FieldValue.delete(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
}

export const unarchiveActivity = async (id: string, data?: any) => {
  let updateData = {
    archived: false,
    updated_at: new Date(),
    archived_at: admin.firestore.FieldValue.delete(),
    unarchived_at: new Date(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db
    .collection(collectionName)
    .doc(id)
    .update(updateData)
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
  const activityRef = db.collection(collectionName)
  const activities = await db
    .collection(collectionName)
    .where(idType, '==', id)
    .orderBy('created_at', 'desc')
    .get()

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
        images: images.docs.map((doc): any => {
          return { id: doc.id, ...doc.data() }
        }),
        liked,
      }
    })
  )
}

const archiveActivityBy = async (status: boolean, idType: string, id: string) => {
  const activitiesRef = await db.collection(collectionName).where(idType, '==', id).get()

  const batch = db.batch()
  activitiesRef.forEach((activity) => {
    const activityRef = activity.ref
    const updateData: any = {
      archived: status,
      updated_at: new Date(),
    }
    batch.update(activityRef, updateData)
  })
  const result = await batch.commit()
  return result
}

export const incrementActivityCommentCount = async (id: string) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({
      '_meta.comment_count': admin.firestore.FieldValue.increment(1),
    })
}

export const deccrementActivityCommentCount = async (id: string) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({
      '_meta.comment_count': admin.firestore.FieldValue.increment(-1),
    })
}

export const incrementActivityLikeCount = async (id: string) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({
      '_meta.likes_count': admin.firestore.FieldValue.increment(1),
    })
}

export const deccrementActivityLikeCount = async (id: string) => {
  return await db
    .collection(collectionName)
    .doc(id)
    .update({
      '_meta.likes_count': admin.firestore.FieldValue.increment(-1),
    })
}

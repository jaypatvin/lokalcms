import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getActivitiesByUserID = async (id) => await getActivitiesBy('user_id', id)
export const getActivitiesByCommunityID = async (id) => await getActivitiesBy('community_id', id)

export const getActivityById = async (id) => {
  const activityRef = db.collection('activities').doc(id)
  const activity = await activityRef.get()
  const images = await activityRef.collection('images').get()
  const data = activity.data()
  if (data)
    return {
      id: activity.id,
      ...data,
      images: images.docs.map((doc): any => {
        return { id: doc.id, ...doc.data() }
      }),
    } as any

  return data
}

export const getAllActivities = async () => {
  const activityRef = db.collection('activities')
  const activities = await db.collection('activities').get()

  return await Promise.all(
    activities.docs.map(async (activityDoc) => {
      const images = await activityRef.doc(activityDoc.id).collection('images').get()
      return {
        id: activityDoc.id,
        ...activityDoc.data(),
        images: images.docs.map((doc): any => {
          return { id: doc.id, ...doc.data() }
        }),
      }
    })
  )
}

// new post, no comments in here
export const createActivity = async (data) => {
  const activityRef = db.collection('activities').doc()
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
    .collection('activities')
    .doc(id)
    .update({ ...data, updated_at: new Date(), updated_content_at: new Date() })
}

export const archiveActivity = async (id) => {
  return await db.collection('activities').doc(id).update({
    archived: true,
    updated_at: new Date(),
    archived_at: new Date(),
    unarchived_at: admin.firestore.FieldValue.delete(),
  })
}

export const unarchiveActivity = async (id) => {
  return await db.collection('activities').doc(id).update({
    archived: false,
    updated_at: new Date(),
    archived_at: admin.firestore.FieldValue.delete(),
    unarchived_at: new Date(),
  })
}

export const archiveUserActivities = async (user_id) =>
  await archiveActivityBy(true, 'user_id', user_id)

export const archiveCommunityActivities = async (community_id) =>
  await archiveActivityBy(true, 'community_id', community_id)

export const unarchiveUserActivities = async (user_id) =>
  await archiveActivityBy(false, 'user_id', user_id)

export const unarchiveCommunityActivities = async (community_id) =>
  await archiveActivityBy(false, 'community_id', community_id)

const getActivitiesBy = async (idType, id) => {
  const activityRef = db.collection('activities')
  const activities = await db.collection('activities').where(idType, '==', id).get()

  return await Promise.all(
    activities.docs.map(async (activityDoc) => {
      const images = await activityRef.doc(activityDoc.id).collection('images').get()
      return {
        id: activityDoc.id,
        ...activityDoc.data(),
        images: images.docs.map((doc): any => {
          return { id: doc.id, ...doc.data() }
        }),
      }
    })
  )
}

const archiveActivityBy = async (status: boolean, idType: string, id: string) => {
  const activitiesRef = await db.collection('activities').where(idType, '==', id).get()

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

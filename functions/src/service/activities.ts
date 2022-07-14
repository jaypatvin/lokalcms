import { doc, getDoc, increment, orderBy, updateDoc, where } from 'firebase/firestore'
import { ActivityCreateData, ActivityUpdateData } from '../models/Activity'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.activities)

export { findAll, findByCommunityId, findById }

export const create = (data: ActivityCreateData) => baseCreate(data)
export const update = (id: string, data: ActivityUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: ActivityUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: ActivityUpdateData) => baseUnarchive(id, data)

export const findActivitiesByUserId = async (id: string, userId = '') =>
  await findActivitiesBy('user_id', id, userId)
export const findActivitiesByCommunityId = async (id: string, userId = '') =>
  await findActivitiesBy('community_id', id, userId)

export const findActivityById = async (id: string, userId = '') => {
  const activity = await findById(id)

  if (!activity) return null

  let liked = false
  if (userId) {
    const likeDoc = await getDoc(doc(db.getLikes(`activities/${id}/likes`), `${id}_${userId}_like`))
    liked = likeDoc.exists()
  }

  return {
    ...activity,
    liked,
  }
}

export const getAllActivities = async (userId = '') => {
  const allActivities = await findAll({
    wheres: [orderBy('created_at', 'desc')],
  })

  return await Promise.all(
    allActivities.map(async (activity) => {
      let liked = false
      if (userId) {
        const likeDoc = await getDoc(
          doc(db.getLikes(`activities/${activity.id}/likes`), `${activity.id}_${userId}_like`)
        )
        liked = likeDoc.exists()
      }
      return {
        ...activity,
        liked,
      }
    })
  )
}

const findActivitiesBy = async (idType, id, userId = '') => {
  const allActivities = await findAll({
    wheres: [where(idType, '==', id), orderBy('created_at', 'desc')],
  })

  return await Promise.all(
    allActivities.map(async (activity) => {
      let liked = false
      if (userId) {
        const likeDoc = await getDoc(
          doc(db.getLikes(`activities/${activity.id}/likes`), `${activity.id}_${userId}_like`)
        )
        liked = likeDoc.exists()
      }
      return {
        ...activity,
        liked,
      }
    })
  )
}

export const incrementActivityCommentCount = async (id: string) => {
  const docRef = doc(db.activities, id)
  return await updateDoc(docRef, {
    '_meta.comments_count': increment(1),
  })
}

export const deccrementActivityCommentCount = async (id: string) => {
  const docRef = doc(db.activities, id)
  return await updateDoc(docRef, {
    '_meta.comments_count': increment(-1),
  })
}

import { getDoc, doc, query, where, getDocs } from 'firebase/firestore'
import { CommentCreateData, CommentUpdateData } from '../models/Comment'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const create = (activityId: string, data: CommentCreateData) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).create(data)
}

export const update = (activityId: string, id: string, data: CommentUpdateData) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).update(
    id,
    data
  )
}

export const archive = (activityId: string, id: string, data?) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).archive(
    id,
    data
  )
}

export const unarchive = (activityId: string, id: string, data?) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).unarchive(
    id,
    data
  )
}

export const findAllActivityComments = async (activityId: string, userId = '') => {
  const comments = await createBaseMethods(
    db.getActivityComments(`activities/${activityId}/comments`)
  ).findAll()

  return await Promise.all(
    comments.map(async (comment) => {
      let liked = false
      if (userId) {
        const likeDoc = await getDoc(
          doc(
            db.getLikes(`activities/${activityId}/comments/${comment.id}/likes`),
            `${comment.id}_${userId}_like`
          )
        )
        liked = likeDoc.exists()
      }
      return {
        ...comment,
        liked,
      }
    })
  )
}

export const findActivityComment = async (activityId: string, commentId: string, userId = '') => {
  const comment = await createBaseMethods(
    db.getActivityComments(`activities/${activityId}/comments`)
  ).findById(commentId)

  if (!comment) return null

  let liked = false
  if (userId) {
    const likeDoc = await getDoc(
      doc(
        db.getLikes(`activities/${activityId}/comments/${comment.id}/likes`),
        `${comment.id}_${userId}_like`
      )
    )
    liked = likeDoc.exists()
  }

  return {
    ...comment,
    liked,
  }
}

export const findCommentsByUser = async (userId: string) => {
  const commentsQuery = query(db.comments, where('user_id', '==', userId))
  const snapshot = await getDocs(commentsQuery)
  const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

  return await Promise.all(
    comments.map(async (comment) => {
      let liked = false
      if (userId) {
        const likeDoc = await getDoc(
          doc(
            db.getLikes(`activities/${comment.activity_id}/comments/${comment.id}/likes`),
            `${comment.id}_${userId}_like`
          )
        )
        liked = likeDoc.exists()
      }
      return {
        ...comment,
        liked,
      }
    })
  )
}

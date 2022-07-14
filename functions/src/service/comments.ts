import { getDoc, doc, Timestamp } from 'firebase/firestore'
import { UsersService } from '.'
import { CommentCreateData, CommentUpdateData } from '../models/Comment'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const create = (activityId: string, data: CommentCreateData) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).create(data)
}

export const update = (activityId: string, id: string, data: CommentUpdateData) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).update(id, data)
}

export const archive = (activityId: string, id: string, data) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).archive(
    id,
    data
  )
}

export const unarchive = (activityId: string, id: string, data) => {
  return createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).unarchive(
    id,
    data
  )
}

export const findAllActivityComments = async (activityId: string, userId = '') => {
  const comments = await createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).findAll()

  return await Promise.all(
    comments.map(async (comment) => {
      let liked = false
      if (userId) {
        const likeDoc = await getDoc(
          doc(db.getLikes(`activities/${activityId}/comments/${comment.id}/likes`), `${comment.id}_${userId}_like`)
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

export const findActivityComment = async (activityId: string, commentId: string, userId: '') => {
  const comment = await createBaseMethods(db.getActivityComments(`activities/${activityId}/comments`)).findById(commentId)

  if (!comment) return null

  let liked = false
  if (userId) {
    const likeDoc = await getDoc(doc(db.getLikes(`activities/${activityId}/comments/${comment.id}/likes`), `${comment.id}_${userId}_like`))
    liked = likeDoc.exists()
  }

  return {
    ...comment,
    liked,
  }
}

// this method is expected to be slow since we're checking each activity
// if they contain the comment document
// additional optimizations are required
export const getUserComments = async (userId: string) => {
  const comments = await db.comments.where('user_id', '==', userId).get()

  return await Promise.all(
    comments.docs.map(async (commentDoc) => {
      console.log('comment id: ' + commentDoc.id)
      const activities = await db.activities.get()
      for (let activity of activities.docs) {
        const data = await db
          .getActivityComments(`activities/${activity.id}/comments`)
          .doc(commentDoc.id)
          .get()

        if (data) {
          let liked = false
          if (userId) {
            const likeDoc = await db
              .getActivityComments(`activities/${activity.id}/comments`)
              .doc(commentDoc.id)
              .collection('likes')
              .doc(`${commentDoc.id}_${userId}_like`)
              .get()
            liked = likeDoc.exists
          }

          return {
            activityId: activity.id,
            commentId: commentDoc.id,
            ...commentDoc.data(),
            liked,
          }
        }
      }
      return undefined
    })
  )
}

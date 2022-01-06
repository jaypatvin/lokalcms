import * as admin from 'firebase-admin'
import { UsersService } from '.'
import { CommentCreateData, CommentUpdateData } from '../models/Comment'
import db from '../utils/db'

const firestoreDb = admin.firestore()

export const getActivityComments = async (activityId: string, userId = '') => {
  const commentsRef = db.getActivityComments(`activity/${activityId}/comments`)
  const comments = await commentsRef.get()

  return await Promise.all(
    comments.docs.map(async (commentDoc) => {
      let liked = false
      if (userId) {
        const likeDoc = await commentsRef
          .doc(commentDoc.id)
          .collection('likes')
          .doc(`${commentDoc.id}_${userId}_like`)
          .get()
        liked = likeDoc.exists
      }
      return {
        id: commentDoc.id,
        ...commentDoc.data(),
        liked,
      }
    })
  )
}

// this method is expected to be slow since we're checking each activity
// if they contain the comment document
// additional optimizations are required
export const getUserComments = async (userId: string) => {
  const commentsRef = firestoreDb.collectionGroup('comments')
  const comments = await commentsRef.where('user_id', '==', userId).get()

  return await Promise.all(
    comments.docs.map(async (commentDoc) => {
      console.log('comment id: ' + commentDoc.id)
      const activities = await db.activities.get()
      for (let activity of activities.docs) {
        const data = await db
          .getActivityComments(`activity/${activity.id}/comments`)
          .doc(commentDoc.id)
          .get()

        if (data) {
          let liked = false
          if (userId) {
            const likeDoc = await db
              .getActivityComments(`activity/${activity.id}/comments`)
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

export const getAllComments = async () => {
  return await firestoreDb
    .collectionGroup('comments')
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getCommentById = async (activityId: string, commentId: string, userId = '') => {
  // alternatively, we can use db.collectionGroup to query from all subcollections of 'comments'
  // however, we need to add a field for 'id' inside of 'comments' documents for querying
  const commentRef = db.getActivityComments(`activity/${activityId}/comments`).doc(commentId)
  const comment = await commentRef.get()
  let liked = false
  if (userId) {
    const likeDoc = await commentRef.collection('likes').doc(`${commentId}_${userId}_like`).get()
    liked = likeDoc.exists
  }
  const data = comment.data()

  if (data)
    return {
      id: comment.id,
      ...data,
      liked,
    } as any

  return null
}

export const addActivityComment = async (activityId: string, data: CommentCreateData) => {
  const commentRef = db.getActivityComments(`activity/${activityId}/comments`).doc()
  const batch = firestoreDb.batch()

  batch.set(commentRef, { ...data, created_at: admin.firestore.Timestamp.now() })
  await batch.commit()
  return commentRef
}

export const updateActivityComment = async (
  activityId: string,
  commentId: string,
  data: CommentUpdateData
) => {
  return await db
    .getActivityComments(`activity/${activityId}/comments`)
    .doc(commentId)
    .update({
      ...data,
      updated_at: admin.firestore.Timestamp.now(),
      updated_content_at: admin.firestore.Timestamp.now(),
    })
}

export const archiveActivityComments = async (activityId: string) => {
  const commentsSnapshot = await db.getActivityComments(`activity/${activityId}/comments`).get()

  const batch = firestoreDb.batch()
  commentsSnapshot.forEach((comment) => {
    const commentRef = comment.ref
    batch.update(commentRef, { archived: true, updated_at: admin.firestore.Timestamp.now() })
  })

  return await batch.commit()
}

export const unarchiveActivityComments = async (activityId: string) => {
  const commentsSnapshot = await db.getActivityComments(`activity/${activityId}/comments`).get()

  const batch = firestoreDb.batch()
  commentsSnapshot.forEach(async (comment) => {
    // we should not unarchive user comments when user is archived since
    // we don't want the users to retrieve and see archived users in the activity comments
    const userId = comment.data().user_id
    const _user = await UsersService.getUserByID(userId)
    if (_user.status === 'archived') return

    const commentRef = comment.ref
    batch.update(commentRef, { archived: false, updated_at: admin.firestore.Timestamp.now() })
  })

  return await batch.commit()
}

export const archiveUserComments = async (userId: string) => _archiveUserComments(userId, true)

// we can still unarchive comments from archived activities unlike
// in unarchiveAtivityComments since
// we will only access comments in the activity
export const unarchiveUserComments = async (userId: string) => _archiveUserComments(userId, false)

export const archiveComment = async (activityId: string, commentId: string) => {
  return await db
    .getActivityComments(`activity/${activityId}/comments`)
    .doc(commentId)
    .update({ archived: true, updated_at: admin.firestore.Timestamp.now() })
}

export const unarchiveComment = async (activityId: string, commentId: string) => {
  return await db
    .getActivityComments(`activity/${activityId}/comments`)
    .doc(commentId)
    .update({ archived: false, updated_at: admin.firestore.Timestamp.now() })
}

const _archiveUserComments = async (userId: string, state: boolean) => {
  const commentsSnapshot = await firestoreDb
    .collectionGroup('comments')
    .where('user_id', '==', userId)
    .get()

  const batch = firestoreDb.batch()
  commentsSnapshot.forEach((comment) =>
    batch.update(comment.ref, { archived: state, updated_at: admin.firestore.Timestamp.now() })
  )

  return await batch.commit()
}

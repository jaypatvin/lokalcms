import * as admin from 'firebase-admin'
import { UsersService } from '.'

const db = admin.firestore()

export const getActivityComments = async (activityId: string) => {
  const commentsRef = db.collection('activities').doc(activityId).collection('comments')
  const comments = await commentsRef.get()

  return await Promise.all(
    comments.docs.map(async (commentDoc) => {
      const images = await commentsRef.doc(commentDoc.id).collection('images').get()
      const likes = await commentsRef.doc(commentDoc.id).collection('comment_likes').get()
      return {
        id: commentDoc.id,
        ...commentDoc.data(),
        images: images.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        likes: likes.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      }
    })
  )
}

// this method is expected to be slow since we're checking each activity
// if they contain the comment document
// additional optimizations are required
export const getUserComments = async (userId: string) => {
  const commentsRef = db.collectionGroup('comments')
  const comments = await commentsRef.where('user_id', '==', userId).get()

  return await Promise.all(
    comments.docs.map(async (commentDoc) => {
      console.log('comment id: ' + commentDoc.id)
      const activities = await db.collection('activities').get()
      for (let activity of activities.docs) {
        const data = await db
          .collection('activities')
          .doc(activity.id)
          .collection('comments')
          .doc(commentDoc.id)
          .get()

        if (data) {
          const images = await db
            .collection('activities')
            .doc(activity.id)
            .collection('comments')
            .doc(commentDoc.id)
            .collection('images')
            .get()

          const likes = await db
            .collection('activities')
            .doc(activity.id)
            .collection('comments')
            .doc(commentDoc.id)
            .collection('comment_likes')
            .get()

          return {
            activityId: activity.id,
            commentId: commentDoc.id,
            ...commentDoc.data(),
            images: images.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })),
            likes: likes.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })),
          }
        }
      }
      return undefined
    })
  )
}

export const getAllComments = async () => {
  return await db
    .collectionGroup('comments')
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getCommentById = async (activityId: string, commentId: string) => {
  // alternatively, we can use db.collectionGroup to query from all subcollections of 'comments'
  // however, we need to add a field for 'id' inside of 'comments' documents for querying
  const commentRef = db
    .collection('activities')
    .doc(activityId)
    .collection('comments')
    .doc(commentId)
  const comment = await commentRef.get()
  const images = await commentRef.collection('images').get()
  const likes = await commentRef.collection('comment_likes').get()
  const data = comment.data()

  if (data)
    return {
      id: comment.id,
      ...data,
      images: images.docs.map((doc): any => {
        return { id: doc.id, ...doc.data() }
      }),
      likes: likes.docs.map((doc): any => ({
        id: doc.id,
        ...doc.data(),
      })),
    } as any

  return data
}

export const addActivityComment = async (activityId: string, data) => {
  const commentRef = db.collection('activities').doc(activityId).collection('comments').doc()
  const batch = db.batch()

  if (data.images) {
    data.images.forEach((image) => {
      const imageRef = commentRef.collection('images').doc()
      batch.set(imageRef, image)
    })
    delete data.images
  }
  batch.set(commentRef, { ...data, created_at: new Date() })
  await batch.commit()
  return commentRef
}

export const updateActivityComment = async (activityId: string, commentId: string, data) => {
  return await db
    .collection('activities')
    .doc(activityId)
    .collection('comments')
    .doc(commentId)
    .update({ ...data, updated_at: new Date(), updated_content_at: new Date() })
}

export const archiveActivityComments = async (activityId: string) => {
  const commentsSnapshot = await db
    .collection('activities')
    .doc(activityId)
    .collection('comments')
    .get()

  const batch = db.batch()
  commentsSnapshot.forEach((comment) => {
    const commentRef = comment.ref
    batch.update(commentRef, { archived: true, updated_at: new Date() })
  })

  return await batch.commit()
}

export const unarchiveActivityComments = async (activityId: string) => {
  const commentsSnapshot = await db
    .collection('activities')
    .doc(activityId)
    .collection('comments')
    .get()

  const batch = db.batch()
  commentsSnapshot.forEach(async (comment) => {
    // we should not unarchive user comments when user is archived since
    // we don't want the users to retrieve and see archived users in the activity comments
    const userId = comment.data().user_id
    const _user = await UsersService.getUserByID(userId)
    if (_user.status === 'archived') return

    const commentRef = comment.ref
    batch.update(commentRef, { archived: false, updated_at: new Date() })
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
    .collection('activities')
    .doc(activityId)
    .collection('comments')
    .doc(commentId)
    .update({ archived: true, updated_at: new Date() })
}

export const unarchiveComment = async (activityId: string, commentId: string) => {
  return await db
    .collection('activities')
    .doc(activityId)
    .collection('comments')
    .doc(commentId)
    .update({ archived: false, updated_at: new Date() })
}

const _archiveUserComments = async (userId: string, state: boolean) => {
  const commentsSnapshot = await db.collectionGroup('comments').where('user_id', '==', userId).get()

  const batch = db.batch()
  commentsSnapshot.forEach((comment) =>
    batch.update(comment.ref, { archived: state, updated_at: new Date() })
  )

  return await batch.commit()
}

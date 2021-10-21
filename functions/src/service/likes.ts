import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getProductLike = async (product_id: string, user_id: string) => {
  const like = await db
    .collection('products')
    .doc(product_id)
    .collection('likes')
    .doc(`${product_id}_${user_id}_like`)
    .get()
  return like.data()
}

export const addProductLike = async (product_id: string, user_id: string) => {
  const likeRef = db
    .collection('products')
    .doc(product_id)
    .collection('likes')
    .doc(`${product_id}_${user_id}_like`)
  return await likeRef.set({ user_id, created_at: new Date() })
}

export const removeProductLike = async (product_id: string, user_id: string) => {
  return await db
    .collection('products')
    .doc(product_id)
    .collection('likes')
    .doc(`${product_id}_${user_id}_like`)
    .delete()
}

export const getShopLike = async (shop_id: string, user_id: string) => {
  const like = await db
    .collection('shops')
    .doc(shop_id)
    .collection('likes')
    .doc(`${shop_id}_${user_id}_like`)
    .get()
  return like.data()
}

export const addShopLike = async (shop_id: string, user_id: string) => {
  const likeRef = db
    .collection('shops')
    .doc(shop_id)
    .collection('likes')
    .doc(`${shop_id}_${user_id}_like`)
  return await likeRef.set({ user_id, created_at: new Date() })
}

export const removeShopLike = async (shop_id: string, user_id: string) => {
  return await db
    .collection('shops')
    .doc(shop_id)
    .collection('likes')
    .doc(`${shop_id}_${user_id}_like`)
    .delete()
}

export const getActivityLike = async (activity_id: string, user_id: string) => {
  const like = await db
    .collection('activities')
    .doc(activity_id)
    .collection('likes')
    .doc(`${activity_id}_${user_id}_like`)
    .get()
  return like.data()
}

export const addActivityLike = async (activity_id: string, user_id: string) => {
  const likeRef = db
    .collection('activities')
    .doc(activity_id)
    .collection('likes')
    .doc(`${activity_id}_${user_id}_like`)
  return await likeRef.set({ user_id, created_at: new Date() })
}

export const removeActivityLike = async (activity_id: string, user_id: string) => {
  return await db
    .collection('activities')
    .doc(activity_id)
    .collection('likes')
    .doc(`${activity_id}_${user_id}_like`)
    .delete()
}

// no other way around this except adding the comment_id as field inside "comments" collectionGroup
export const addCommentLike = async (activity_id: string, comment_id: string, user_id: string) => {
  const likeRef = await db
    .collection('activities')
    .doc(activity_id)
    .collection('comments')
    .doc(comment_id)
    .collection('comment_likes')
    .doc(`${comment_id}_${user_id}_like`)

  return await likeRef.set({ user_id, created_at: new Date() })
}

// alternatively, we can add the "id" of comment_likes to its field to access the document through collectionGroup
export const removeCommentLike = async (
  activity_id: string,
  comment_id: string,
  user_id: string
) => {
  return await db
    .collection('activities')
    .doc(activity_id)
    .collection('comments')
    .doc(comment_id)
    .collection('comment_likes')
    .doc(`${comment_id}_${user_id}_like`)
    .delete()
}

import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getWishlistsByUser = async (user_id: string) => {
  return db
    .collectionGroup('wishlists')
    .where('user_id', '==', user_id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getWishlistsByShop = async (shop_id: string) => {
  return db
    .collectionGroup('wishlists')
    .where('shop_id', '==', shop_id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getProductWishlist = async (product_id: string, user_id: string) => {
  const wishlist = await db
    .collection('products')
    .doc(product_id)
    .collection('wishlists')
    .doc(`${product_id}_${user_id}_wishlist`)
    .get()
  return wishlist.data()
}

export const getProductWishlists = async (product_id: string) => {
  const wishlists = await db.collection('products').doc(product_id).collection('wishlists').get()
  return wishlists.docs.map((doc): any => ({ ...doc.data(), id: doc.id }))
}

export const addProductWishlist = async (product_id: string, user_id: string, data: any = {}) => {
  const wishlistRef = db
    .collection('products')
    .doc(product_id)
    .collection('wishlists')
    .doc(`${product_id}_${user_id}_wishlist`)
  return await wishlistRef.set({
    ...data,
    user_id,
    product_id,
    created_at: new Date(),
  })
}

export const removeProductWishlist = async (product_id: string, user_id: string) => {
  return await db
    .collection('products')
    .doc(product_id)
    .collection('wishlists')
    .doc(`${product_id}_${user_id}_wishlist`)
    .delete()
}

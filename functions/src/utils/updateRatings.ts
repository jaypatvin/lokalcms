import * as admin from 'firebase-admin'

const db = admin.firestore()

const updateRatings = async (change, context) => {
  const ratingVal = change.after.data().rating

  const productRef = db.collection('products').doc(context.params.productId)

  await db.runTransaction(async (transaction) => {
    const productDoc = await transaction.get(productRef)

    const newNumRatings = productDoc.data().numRatings + 1

    const oldRatingTotal = productDoc.data().avgRating * productDoc.data().numRatings
    const newAvgRating = (oldRatingTotal + ratingVal) / newNumRatings

    transaction.update(productRef, {
      avgRating: newAvgRating,
      numRatings: newNumRatings,
    })
  })
}

export default updateRatings

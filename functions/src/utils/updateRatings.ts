import * as admin from 'firebase-admin'
import { Change, EventContext } from 'firebase-functions'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

const db = admin.firestore()

const updateRatings = async (change: Change<DocumentSnapshot>, context: EventContext) => {
  const isCreate = change.after.exists && !change.before.exists
  const isUpdate = change.before.exists && change.after.exists
  const isDelete = change.before.exists && !change.after.exists

  const productRef = db.collection('products').doc(context.params.productId)

  await db.runTransaction(async (transaction) => {
    const productDoc = await transaction.get(productRef)
    const { numRatings = 0, avgRating = 0 } = productDoc.data()
    let newNumRatings = numRatings
    let oldRatingTotal = avgRating * numRatings
    let newAvgRating = avgRating

    if (isCreate) {
      const ratingVal = change.after.data().value
      newNumRatings = newNumRatings + 1
      newAvgRating = (oldRatingTotal + ratingVal) / newNumRatings
    }

    if (isUpdate) {
      const ratingVal = change.after.data().value
      const prevRatingVal = change.before.data().value
      newAvgRating = (oldRatingTotal - prevRatingVal + ratingVal) / newNumRatings
    }

    if (isDelete) {
      const ratingVal = change.before.data().value
      newNumRatings = newNumRatings - 1
      newAvgRating = !newNumRatings ? 0 : (oldRatingTotal - ratingVal) / newNumRatings
    }

    transaction.update(productRef, {
      avgRating: newAvgRating,
      numRatings: newNumRatings,
    })
  })
}

export default updateRatings

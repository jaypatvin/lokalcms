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
    const { _meta = {} } = productDoc.data()
    const { average_rating = 0, reviews_count = 0 } = _meta
    let newNumRatings = reviews_count
    let oldRatingTotal = average_rating * reviews_count
    let newAvgRating = average_rating

    if (isCreate) {
      const ratingVal = change.after.data().rating
      newNumRatings = newNumRatings + 1
      newAvgRating = (oldRatingTotal + ratingVal) / newNumRatings
    }

    if (isUpdate) {
      const ratingVal = change.after.data().rating
      const prevRatingVal = change.before.data().rating
      newAvgRating = (oldRatingTotal - prevRatingVal + ratingVal) / newNumRatings
    }

    if (isDelete) {
      const ratingVal = change.before.data().rating
      newNumRatings = newNumRatings - 1
      newAvgRating = !newNumRatings ? 0 : (oldRatingTotal - ratingVal) / newNumRatings
    }

    transaction.update(productRef, {
      '_meta.average_rating': newAvgRating,
    })
  })
}

export default updateRatings

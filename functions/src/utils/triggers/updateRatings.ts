import { doc, getFirestore, runTransaction } from 'firebase/firestore'
import { Change, EventContext, firestore as functionFirestore } from 'firebase-functions'
import { db } from '../../utils/db'

const firestore = getFirestore()

const updateRatings = async (change: Change<functionFirestore.DocumentSnapshot>, context: EventContext) => {
  const isCreate = change.after.exists && !change.before.exists
  const isUpdate = change.before.exists && change.after.exists
  const isDelete = change.before.exists && !change.after.exists

  const productRef = doc(db.products, context.params.productId)

  await runTransaction(firestore, async (transaction) => {
    const productDoc = await transaction.get(productRef)
    const { _meta = {} } = productDoc.data()!
    const { average_rating = 0, reviews_count = 0 } = _meta
    let newNumRatings = reviews_count
    let oldRatingTotal = average_rating * reviews_count
    let newAvgRating = average_rating

    if (isCreate) {
      const ratingVal = change.after.data()?.rating ?? 0
      newNumRatings = newNumRatings + 1
      newAvgRating = (oldRatingTotal + ratingVal) / newNumRatings
    }

    if (isUpdate) {
      const ratingVal = change.after.data()?.rating ?? 0
      const prevRatingVal = change.before.data()?.rating ?? 0
      newAvgRating = (oldRatingTotal - prevRatingVal + ratingVal) / newNumRatings
    }

    if (isDelete) {
      const ratingVal = change.before.data()?.rating ?? 0
      newNumRatings = newNumRatings - 1
      newAvgRating = !newNumRatings ? 0 : (oldRatingTotal - ratingVal) / newNumRatings
    }

    transaction.update(productRef, {
      '_meta.average_rating': newAvgRating,
    })
  })
}

export default updateRatings

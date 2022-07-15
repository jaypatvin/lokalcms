import { firestore } from 'firebase-functions'
import { updateRatings } from '../utils/triggers'

exports.aggregateProductRatings = firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onWrite(async (change, context) => {
    updateRatings(change, context)
    return
  })

/* eslint-disable import/first */
import * as functions from 'firebase-functions'
import { updateRatings } from '../utils/triggers'

exports.aggregateProductRatings = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onWrite(async (change, context) => {
    updateRatings(change, context)
    return
  })

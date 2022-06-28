import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { reviewFields } from './algoliaFields'
import db from '../../utils/db'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const reviewsIndex = client.initIndex('reviews')

exports.addReviewIndex = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const userRef = await db.users.doc(data.user_id).get()
    const userEmail = userRef.data().email

    const review = {
      objectID: snapshot.id,
      ...pick(data, reviewFields),
      user_email: userEmail,
    }

    return reviewsIndex.saveObject(review)
  })

exports.updateReviewIndex = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onUpdate(async (change) => {
    const newData = change.after.data()

    const extraFields: any = {}

    if (!newData.user_email) {
      const userRef = await db.users.doc(newData.user_id).get()
      const userEmail = userRef.data().email
      extraFields.user_email = userEmail
    }

    const review = {
      objectID: change.after.id,
      ...pick(newData, reviewFields),
      ...extraFields,
    }

    return reviewsIndex.saveObject(review)
  })

exports.deleteReviewIndex = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onDelete((snapshot) => {
    return reviewsIndex.deleteObject(snapshot.id)
  })

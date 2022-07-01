import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { commentFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const commentsIndex = client.initIndex('comments')

exports.addCommentIndex = functions.firestore
  .document('activities/{activityId}/comments/{commentId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data()
    const product = {
      objectID: snapshot.id,
      activity_id: context.params.activityId,
      ...pick(data, commentFields),
    }

    return commentsIndex.saveObject(product)
  })
exports.updateCommentIndex = functions.firestore
  .document('activities/{activityId}/comments/{commentId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data()
    const comment = {
      objectID: change.after.id,
      activity_id: context.params.activityId,
      ...pick(newData, commentFields),
    }

    return commentsIndex.saveObject(comment)
  })
exports.deleteCommentIndex = functions.firestore
  .document('activities/{activityId}/comments/{commentId}')
  .onDelete((snapshot) => {
    return commentsIndex.deleteObject(snapshot.id)
  })
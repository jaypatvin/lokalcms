import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { activityFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const activitiesIndex = client.initIndex('activities')

exports.addActivityIndex = functions.firestore.document('activities/{activityId}').onCreate((snapshot) => {
  const data = snapshot.data()
  const user = {
    objectID: snapshot.id,
    ...pick(data, activityFields),
  }

  return activitiesIndex.saveObject(user)
})

exports.updateActivityIndex = functions.firestore.document('activities/{activityId}').onUpdate((change) => {
  const newData = change.after.data()
  const user = {
    objectID: change.after.id,
    ...pick(newData, activityFields),
  }

  return activitiesIndex.saveObject(user)
})

exports.deleteActivityIndex = functions.firestore.document('activities/{activityId}').onDelete((snapshot) => {
  return activitiesIndex.deleteObject(snapshot.id)
})

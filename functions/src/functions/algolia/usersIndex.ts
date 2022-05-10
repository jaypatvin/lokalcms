import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { userFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const usersIndex = client.initIndex('users')

exports.addUserIndex = functions.firestore.document('users/{userId}').onCreate((snapshot) => {
  const data = snapshot.data()
  const user = {
    objectID: snapshot.id,
    ...pick(data, userFields),
  }

  return usersIndex.saveObject(user)
})

exports.updateUserIndex = functions.firestore.document('users/{userId}').onUpdate((change) => {
  const newData = change.after.data()
  const user = {
    objectID: change.after.id,
    ...pick(newData, userFields),
  }

  return usersIndex.saveObject(user)
})

exports.deleteUserIndex = functions.firestore.document('users/{userId}').onDelete((snapshot) => {
  return usersIndex.deleteObject(snapshot.id)
})

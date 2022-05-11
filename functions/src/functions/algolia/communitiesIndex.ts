import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { communityFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const communitiesIndex = client.initIndex('communities')

exports.addCommunityIndex = functions.firestore
  .document('community/{communityId}')
  .onCreate((snapshot) => {
    const data = snapshot.data()
    const user = {
      objectID: snapshot.id,
      ...pick(data, communityFields),
    }

    return communitiesIndex.saveObject(user)
  })

exports.updateCommunityIndex = functions.firestore
  .document('community/{communityId}')
  .onUpdate((change) => {
    const newData = change.after.data()
    const user = {
      objectID: change.after.id,
      ...pick(newData, communityFields),
    }

    return communitiesIndex.saveObject(user)
  })

exports.deleteCommunityIndex = functions.firestore
  .document('community/{communityId}')
  .onDelete((snapshot) => {
    return communitiesIndex.deleteObject(snapshot.id)
  })

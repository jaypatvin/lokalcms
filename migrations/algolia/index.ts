/* eslint-disable import/first */
import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get } from 'lodash'
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

admin.initializeApp({ projectId: 'lokal-1baac' })
// lokal-app
// const appId = get(functions.config(), 'algolia_config.app_id', '4TDTSDE7AK')
// const apiKey = get(functions.config(), 'algolia_config.api_key', '0b4862933a12e4f86d0dbc45a2e53e9d')
// lokal-app-jet

import importReviews from './reviews'
import importUsers from './users'
import importCommunities from './communities'
import importShopsAndProducts from './shopsAndProducts'
import importChatsAndConversations from './chatsAndConversations'
import importOrders from './orders'
import importProductSubscriptionPlans from './productSubscriptionPlans'
import importActivitiesAndComments from './activitiesAndComments'
import importReports from './reports'

const appId = get(functions.config(), 'algolia_config.app_id', '4DS4A9V4EM')
const apiKey = get(functions.config(), 'algolia_config.api_key', 'de79c046fa3f1680f68a74fd7cc5df42')
const client = algoliasearch(appId, apiKey)

const clearAlgoliaIndex = async () => {
  await client.listIndices().then(({ items }) => {
    const { primaryOps, replicaOps } = items.reduce(
      (memo, { name, primary }) => {
        memo[primary ? 'primaryOps' : 'replicaOps'].push({
          indexName: name,
          action: 'delete',
        })
        return memo
      },
      { primaryOps: [], replicaOps: [] }
    )
    return client
      .multipleBatch(primaryOps)
      .wait()
      .then(() => {
        console.log('Done deleting primary indices')
        return client.multipleBatch(replicaOps).then(() => {
          console.log('Done deleting replica indices')
        })
      })
  })
}

const importToAlgolia = async () => {
  // await clearAlgoliaIndex()

  await importUsers(client)
  await importCommunities(client)
  await importShopsAndProducts(client)
  await importChatsAndConversations(client)
  await importOrders(client)
  await importProductSubscriptionPlans(client)
  await importActivitiesAndComments(client)
  await importReviews(client)
  await importReports(client)
}

importToAlgolia().finally(() => {
  process.exit()
})

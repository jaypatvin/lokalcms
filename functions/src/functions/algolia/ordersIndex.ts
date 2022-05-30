import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { orderFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const ordersIndex = client.initIndex('orders')

exports.addOrderIndex = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const order = {
      objectID: snapshot.id,
      ...pick(data, orderFields),
    }

    return ordersIndex.saveObject(order)
  })
exports.updateOrderIndex = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change) => {
    const data = change.after.data()

    const order = {
      objectID: change.after.id,
      ...pick(data, orderFields),
    }

    return ordersIndex.saveObject(order)
  })
exports.deleteOrderIndex = functions.firestore.document('orders/{orderId}').onDelete((snapshot) => {
  return ordersIndex.deleteObject(snapshot.id)
})

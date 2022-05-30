import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { productSubscriptionPlanFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const productSubscriptionPlansIndex = client.initIndex('product_subscription_plans')

exports.addProductSubscriptionPlanIndex = functions.firestore
  .document('product_subscription_plans/{planId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const plan = {
      objectID: snapshot.id,
      ...pick(data, productSubscriptionPlanFields),
    }

    return productSubscriptionPlansIndex.saveObject(plan)
  })
exports.updateProductSubscriptionPlanIndex = functions.firestore
  .document('product_subscription_plans/{planId}')
  .onUpdate(async (change) => {
    const data = change.after.data()

    const plan = {
      objectID: change.after.id,
      ...pick(data, productSubscriptionPlanFields),
    }

    return productSubscriptionPlansIndex.saveObject(plan)
  })
exports.deleteProductSubscriptionPlanIndex = functions.firestore
  .document('product_subscription_plans/{planId}')
  .onDelete((snapshot) => {
    return productSubscriptionPlansIndex.deleteObject(snapshot.id)
  })

import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { shopFields, productFields } from './algoliaFields'
import db from '../../utils/db'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const shopsIndex = client.initIndex('shops')
const productsIndex = client.initIndex('products')

exports.addShopIndex = functions.firestore.document('shops/{shopId}').onCreate((snapshot) => {
  const data = snapshot.data()
  const shop = {
    objectID: snapshot.id,
    ...pick(data, shopFields),
  }

  return shopsIndex.saveObject(shop)
})

exports.updateShopIndex = functions.firestore
  .document('shops/{shopId}')
  .onUpdate(async (change) => {
    const oldData = change.before.data()
    const newData = change.after.data()
    const shop = {
      objectID: change.after.id,
      ...pick(newData, shopFields),
    }

    if (oldData.name !== newData.name) {
      const productObjects = []
      const productsRef = await db.products.where('shop_id', '==', newData.id).get()
      for (const doc of productsRef.docs) {
        const productData = doc.data()
        productObjects.push({
          objectID: doc.id,
          ...pick(productData, productFields),
          shop_name: newData.name,
        })
      }
      await productsIndex.saveObjects(productObjects)
    }

    return shopsIndex.saveObject(shop)
  })

exports.deleteShopIndex = functions.firestore.document('shops/{shopId}').onDelete((snapshot) => {
  return shopsIndex.deleteObject(snapshot.id)
})

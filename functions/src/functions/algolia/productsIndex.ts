import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { productFields } from './algoliaFields'
import db from '../../utils/db'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const shopsIndex = client.initIndex('shops')
const productsIndex = client.initIndex('products')

exports.addProductIndex = functions.firestore
  .document('products/{productId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()
    const shop = await (await db.shops.doc(data.shop_id).get()).data()
    const product = {
      objectID: snapshot.id,
      ...pick(data, productFields),
      shop_name: shop.name,
    }

    await shopsIndex.partialUpdateObject({
      products: {
        _operation: 'AddUnique',
        value: data.name,
      },
      categories: {
        _operation: 'AddUnique',
        value: data.product_category,
      },
      objectID: data.shop_id,
    })

    return productsIndex.saveObject(product)
  })
exports.updateProductIndex = functions.firestore
  .document('products/{productId}')
  .onUpdate(async (change) => {
    const oldData = change.before.data()
    const newData = change.after.data()
    const product = {
      objectID: change.after.id,
      ...pick(newData, productFields),
    }

    if (oldData.name !== newData.name || oldData.product_category !== newData.product_category) {
      await shopsIndex.partialUpdateObject({
        products: {
          _operation: 'AddUnique',
          value: newData.name,
        },
        categories: {
          _operation: 'AddUnique',
          value: newData.product_category,
        },
        objectID: newData.shop_id,
      })
    }

    return productsIndex.saveObject(product)
  })
exports.deleteProductIndex = functions.firestore
  .document('products/{productId}')
  .onDelete((snapshot) => {
    return productsIndex.deleteObject(snapshot.id)
  })

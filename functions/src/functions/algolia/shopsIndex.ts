import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { shopFields, productFields } from './algoliaFields'
import { ProductsService } from '../../service'
import { Product } from '../../models'

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
      const productObjects: (Product & { shop_name: string; objectID: string })[] = []
      const products = await ProductsService.findProductsByShopId(newData.id)
      for (const product of products) {
        productObjects.push({
          objectID: product.id,
          ...(pick(product, productFields) as Product),
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

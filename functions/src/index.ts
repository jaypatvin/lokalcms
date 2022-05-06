/* eslint-disable import/first */
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import algoliasearch from 'algoliasearch'
import { get, pick, uniq, isEqual, sortBy } from 'lodash'
admin.initializeApp()

import { authMiddleware, roleMiddleware, errorAlert, errorResponder } from './middlewares'

import helloRouter from './v1/https/hello.function'
import { runCounter, logActivity, updateRatings } from './utils/triggers'
import generateProductSubscriptions from './scheduled/generateProductSubscriptions'
import notifyUsersOnproductSubscriptions from './scheduled/notifyUsersOnProductSubscriptions'
import { errorHandler } from './middlewares/validation'
import {
  chatFields,
  conversationFields,
  orderFields,
  productFields,
  productSubscriptionPlanFields,
  shopFields,
  userFields,
} from './utils/algoliaFields'
import db from './utils/db'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)
const usersIndex = client.initIndex('users')
const shopsIndex = client.initIndex('shops')
const productsIndex = client.initIndex('products')
const chatsIndex = client.initIndex('chats')
const conversationsIndex = client.initIndex('conversations')
const ordersIndex = client.initIndex('orders')
const productSubscriptionPlansIndex = client.initIndex('product_subscription_plans')

const app = express()
app.use(cors({ origin: true }))
app.use(compression())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', helloRouter)

app.use(authMiddleware)
app.use(roleMiddleware)

require('./routes')(app)

app.use(errorHandler)
app.use(errorAlert)
app.use(errorResponder)

exports.api = functions.https.onRequest(app)

// algolia indices
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

exports.addChatIndex = functions.firestore.document('chats/{chatId}').onCreate(async (snapshot) => {
  const data = snapshot.data()

  const moreInfo = {
    member_emails: [],
  }

  for (const member of data.members) {
    let user

    if (data.shop_id === member) {
      const shop = await (await db.shops.doc(data.shop_id).get()).data()
      user = await (await db.users.doc(shop.user_id).get()).data()
    } else if (data.product_id === member) {
      const product = await (await db.products.doc(data.product_id).get()).data()
      user = await (await db.users.doc(product.user_id).get()).data()
    } else {
      user = await (await db.users.doc(member).get()).data()
    }

    if (user) {
      moreInfo.member_emails.push(user.email)
    }
  }

  moreInfo.member_emails = uniq(moreInfo.member_emails)

  const chat = {
    objectID: data.id,
    ...pick(data, chatFields),
    ...moreInfo,
  }

  return chatsIndex.saveObject(chat)
})
exports.updateChatIndex = functions.firestore
  .document('chats/{chatId}')
  .onUpdate(async (change) => {
    const oldData = change.before.data()
    const newData = change.after.data()

    const moreInfo: { member_emails?: string[] } = {}
    if (!isEqual(sortBy(oldData.members), sortBy(newData.members))) {
      moreInfo.member_emails = []
      for (const member of newData.members) {
        let user

        if (newData.shop_id === member) {
          const shop = await (await db.shops.doc(newData.shop_id).get()).data()
          user = await (await db.users.doc(shop.user_id).get()).data()
        } else if (newData.product_id === member) {
          const product = await (await db.products.doc(newData.product_id).get()).data()
          user = await (await db.users.doc(product.user_id).get()).data()
        } else {
          user = await (await db.users.doc(member).get()).data()
        }

        if (user) {
          moreInfo.member_emails.push(user.email)
        }
      }

      moreInfo.member_emails = uniq(moreInfo.member_emails)
    }
    const chat = {
      objectID: change.after.id,
      ...pick(newData, chatFields),
      ...moreInfo,
    }

    return chatsIndex.saveObject(chat)
  })
exports.deleteChatIndex = functions.firestore.document('chats/{chatId}').onDelete((snapshot) => {
  return chatsIndex.deleteObject(snapshot.id)
})

exports.addConversationIndex = functions.firestore
  .document('chats/{chatId}/conversations/{conversationId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const chat = {
      objectID: data.id,
      ...pick(data, conversationFields),
    }

    return conversationsIndex.saveObject(chat)
  })
exports.updateConversationIndex = functions.firestore
  .document('chats/{chatId}/conversations/{conversationId}')
  .onUpdate(async (change) => {
    const data = change.after.data()

    const chat = {
      objectID: data.id,
      ...pick(data, conversationFields),
    }

    return conversationsIndex.saveObject(chat)
  })
exports.deleteConversationIndex = functions.firestore
  .document('chats/{chatId}/conversations/{conversationId}')
  .onDelete((snapshot) => {
    return conversationsIndex.deleteObject(snapshot.id)
  })

exports.addOrderIndex = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const order = {
      objectID: data.id,
      ...pick(data, orderFields),
    }

    return ordersIndex.saveObject(order)
  })
exports.updateOrderIndex = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change) => {
    const data = change.after.data()

    const order = {
      objectID: data.id,
      ...pick(data, orderFields),
    }

    return ordersIndex.saveObject(order)
  })
exports.deleteOrderIndex = functions.firestore.document('orders/{orderId}').onDelete((snapshot) => {
  return ordersIndex.deleteObject(snapshot.id)
})

exports.addProductSubscriptionPlanIndex = functions.firestore
  .document('product_subscription_plans/{planId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const plan = {
      objectID: data.id,
      ...pick(data, productSubscriptionPlanFields),
    }

    return productSubscriptionPlansIndex.saveObject(plan)
  })
exports.updateProductSubscriptionPlanIndex = functions.firestore
  .document('product_subscription_plans/{planId}')
  .onUpdate(async (change) => {
    const data = change.after.data()

    const plan = {
      objectID: data.id,
      ...pick(data, productSubscriptionPlanFields),
    }

    return productSubscriptionPlansIndex.saveObject(plan)
  })
exports.deleteProductSubscriptionPlanIndex = functions.firestore
  .document('product_subscription_plans/{planId}')
  .onDelete((snapshot) => {
    return productSubscriptionPlansIndex.deleteObject(snapshot.id)
  })

// Counter functions
exports.userCounter = functions.firestore
  .document('users/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('users', change, context)
  })
exports.communityCounter = functions.firestore
  .document('community/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('community', change, context)
  })
exports.shopCounter = functions.firestore
  .document('shops/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('shops', change, context)
  })
exports.shopSubCounter = functions.firestore
  .document('shops/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('shops', change, context)
  })
exports.productCounter = functions.firestore
  .document('products/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('products', change, context)
  })
exports.productSubCounter = functions.firestore
  .document('products/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('products', change, context)
  })
exports.inviteCounter = functions.firestore
  .document('invites/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('invites', change, context)
  })
exports.categoryCounter = functions.firestore
  .document('categories/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('categories', change, context)
  })
exports.activityCounter = functions.firestore
  .document('activities/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('activities', change, context)
  })
exports.activitySubCounter = functions.firestore
  .document('activities/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('activities', change, context)
  })
exports.orderCounter = functions.firestore
  .document('orders/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('orders', change, context)
  })
exports.actionTypeCounter = functions.firestore
  .document('action_types/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('action_types', change, context)
  })
exports.chatCounter = functions.firestore
  .document('chats/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('chats', change, context)
  })
exports.productSubscriptionPlanCounter = functions.firestore
  .document('product_subscription_plans/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('product_subscription_plans', change, context)
  })

exports.generateProductSubscriptions = functions.pubsub
  .schedule('every 12 hours')
  .onRun(() => generateProductSubscriptions())

exports.notifyUsersOnproductSubscriptions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(notifyUsersOnproductSubscriptions)

exports.aggregateProductRatings = functions.firestore
  .document('products/{productId}/reviews/{reviewId}')
  .onWrite(async (change, context) => {
    updateRatings(change, context)
    return
  })

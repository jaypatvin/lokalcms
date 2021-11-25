/* eslint-disable import/first */
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
admin.initializeApp()

import { authMiddleware, roleMiddleware } from './middlewares'

import helloRouter from './v1/https/hello.function'
import { runCounter } from './utils/counters'
import logActivity from './utils/logActivity'
import generateProductSubscriptions from './scheduled/generateProductSubscriptions'
import notifyUsersOnproductSubscriptions from './scheduled/notifyUsersOnProductSubscriptions'
import updateRatings from './utils/updateRatings'

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

exports.api = functions.https.onRequest(app)

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
  .document('products/{productId}/ratings/{ratingId}')
  .onWrite(async (change, context) => {
    updateRatings(change, context)
    return
  })

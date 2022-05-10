import * as functions from 'firebase-functions'
import { runCounter, logActivity } from '../utils/triggers'

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

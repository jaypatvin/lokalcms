import { firestore } from 'firebase-functions'
import { runCounter, logActivity } from '../utils/triggers'

exports.userCounter = firestore
  .document('users/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('users', change, context)
  })
exports.communityCounter = firestore
  .document('community/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('community', change, context)
  })
exports.shopCounter = firestore
  .document('shops/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('shops', change, context)
  })
exports.shopSubCounter = firestore
  .document('shops/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('shops', change, context)
  })
exports.productCounter = firestore
  .document('products/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('products', change, context)
  })
exports.productSubCounter = firestore
  .document('products/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('products', change, context)
  })
exports.inviteCounter = firestore
  .document('invites/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('invites', change, context)
  })
exports.categoryCounter = firestore
  .document('categories/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('categories', change, context)
  })
exports.activityCounter = firestore
  .document('activities/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('activities', change, context)
  })
exports.activitySubCounter = firestore
  .document('activities/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('activities', change, context)
  })
exports.orderCounter = firestore
  .document('orders/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('orders', change, context)
  })
exports.actionTypeCounter = firestore
  .document('action_types/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('action_types', change, context)
  })
exports.chatCounter = firestore
  .document('chats/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('chats', change, context)
  })
exports.productSubscriptionPlanCounter = firestore
  .document('product_subscription_plans/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('product_subscription_plans', change, context)
  })

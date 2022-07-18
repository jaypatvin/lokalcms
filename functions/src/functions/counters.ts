import { firestore } from 'firebase-functions'
import { runCounter, logActivity, updateRatings } from '../utils/triggers'

exports.userCounter = firestore.document('users/{docId}').onWrite(async (change, context) => {
  await logActivity(change)
  await runCounter('users', change, context)
  return
})
exports.communityCounter = firestore
  .document('community/{docId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('community', change, context)
    return
  })
exports.shopCounter = firestore.document('shops/{docId}').onWrite(async (change, context) => {
  await logActivity(change)
  await runCounter('shops', change, context)
  return
})
exports.shopSubCounter = firestore
  .document('shops/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('shops', change, context)
    return
  })
exports.productCounter = firestore.document('products/{docId}').onWrite(async (change, context) => {
  await logActivity(change)
  await runCounter('products', change, context)
  return
})
exports.productSubCounter = firestore
  .document('products/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('products', change, context)
    if (context.params.subColId === 'reviews') {
      await updateRatings(change, context)
    }
    return
  })
exports.inviteCounter = firestore.document('invites/{docId}').onWrite(async (change, context) => {
  await logActivity(change)
  await runCounter('invites', change, context)
  return
})
exports.categoryCounter = firestore
  .document('categories/{docId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('categories', change, context)
    return
  })
exports.activityCounter = firestore
  .document('activities/{docId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('activities', change, context)
    return
  })
exports.activitySubCounter = firestore
  .document('activities/{docId}/{subColId}/{subDocId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('activities', change, context)
    return
  })
exports.orderCounter = firestore.document('orders/{docId}').onWrite(async (change, context) => {
  await logActivity(change)
  await runCounter('orders', change, context)
  return
})
exports.actionTypeCounter = firestore
  .document('action_types/{docId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('action_types', change, context)
    return
  })
exports.chatCounter = firestore.document('chats/{docId}').onWrite(async (change, context) => {
  await logActivity(change)
  await runCounter('chats', change, context)
  return
})
exports.productSubscriptionPlanCounter = firestore
  .document('product_subscription_plans/{docId}')
  .onWrite(async (change, context) => {
    await logActivity(change)
    await runCounter('product_subscription_plans', change, context)
    return
  })

import * as functions from 'firebase-functions'
import generateProductSubscriptions from '../scheduled/generateProductSubscriptions'
import notifyUsersOnproductSubscriptions from '../scheduled/notifyUsersOnProductSubscriptions'

exports.generateProductSubscriptions = functions.pubsub
  .schedule('every 12 hours')
  .onRun(() => generateProductSubscriptions())

exports.notifyUsersOnproductSubscriptions = functions.pubsub
  .schedule('every 24 hours')
  .onRun(notifyUsersOnproductSubscriptions)

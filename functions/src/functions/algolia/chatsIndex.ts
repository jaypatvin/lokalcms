import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, isEqual, pick, sortBy, uniq } from 'lodash'
import { chatFields } from './algoliaFields'
import db from '../../utils/db'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const chatsIndex = client.initIndex('chats')

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
    objectID: snapshot.id,
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

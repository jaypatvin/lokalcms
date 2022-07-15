import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, isEqual, pick, sortBy, uniq } from 'lodash'
import { chatFields } from './algoliaFields'
import { ProductsService, ShopsService, UsersService } from '../../service'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const chatsIndex = client.initIndex('chats')

exports.addChatIndex = functions.firestore.document('chats/{chatId}').onCreate(async (snapshot) => {
  const data = snapshot.data()

  const moreInfo: {
    member_emails: string[]
  } = {
    member_emails: [],
  }

  for (const member of data.members) {
    let user

    if (data.shop_id === member) {
      const shop = await ShopsService.findById(data.shop_id)
      user = await UsersService.findById(shop!.user_id)
    } else if (data.product_id === member) {
      const product = await ProductsService.findById(data.product_id)
      user = await UsersService.findById(product!.user_id)
    } else {
      user = await UsersService.findById(member)
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
          const shop = await ShopsService.findById(newData.shop_id)
          user = await UsersService.findById(shop!.user_id)
        } else if (newData.product_id === member) {
          const product = await ProductsService.findById(newData.product_id)
          user = await UsersService.findById(product!.user_id)
        } else {
          user = await UsersService.findById(member)
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

import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { conversationFields } from './algoliaFields'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const conversationsIndex = client.initIndex('conversations')

exports.addConversationIndex = functions.firestore
  .document('chats/{chatId}/conversations/{conversationId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const chat = {
      objectID: snapshot.id,
      ...pick(data, conversationFields),
    }

    return conversationsIndex.saveObject(chat)
  })
exports.updateConversationIndex = functions.firestore
  .document('chats/{chatId}/conversations/{conversationId}')
  .onUpdate(async (change) => {
    const data = change.after.data()

    const chat = {
      objectID: change.after.id,
      ...pick(data, conversationFields),
    }

    return conversationsIndex.saveObject(chat)
  })
exports.deleteConversationIndex = functions.firestore
  .document('chats/{chatId}/conversations/{conversationId}')
  .onDelete((snapshot) => {
    return conversationsIndex.deleteObject(snapshot.id)
  })

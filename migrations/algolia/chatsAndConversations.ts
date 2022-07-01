import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick, uniq } from 'lodash'

const db = admin.firestore()

const chatFields = [
  'archived',
  'chat_type',
  'community_id',
  'created_at',
  'customer_name',
  'last_message',
  'members',
  'shop_id',
  'product_id',
  'title',
  'updated_at',
]

const conversationFields = [
  'archived',
  'created_at',
  'media',
  'message',
  'sender_id',
  'sent_at',
  'reply_to',
  'updated_at',
  'community_id',
  'chat_id',
]

const importChatsAndConversations = async (client: SearchClient) => {
  const chatsIndex = client.initIndex('chats')
  const conversationsIndex = client.initIndex('conversations')

  const chatsRef = await db.collection('chats').get()
  const chatDocs = []
  const conversationDocs = []

  for (const chat of chatsRef.docs) {
    const chatData = chat.data()

    const moreInfo = {
      member_emails: [],
    }

    for (const member of chatData.members) {
      let user

      if (chatData.shop_id === member) {
        const shop = await (await db.collection('shops').doc(chatData.shop_id).get()).data()
        user = await (await db.collection('users').doc(shop.user_id).get()).data()
      } else if (chatData.product_id === member) {
        const product = await (
          await db.collection('products').doc(chatData.product_id).get()
        ).data()
        user = await (await db.collection('users').doc(product.user_id).get()).data()
      } else {
        user = await (await db.collection('users').doc(member).get()).data()
      }

      if (user) {
        moreInfo.member_emails.push(user.email)
      }
    }

    moreInfo.member_emails = uniq(moreInfo.member_emails)

    const conversationRef = await db
      .collection('chats')
      .doc(chat.id)
      .collection('conversation')
      .get()
    for (const doc of conversationRef.docs) {
      const data = doc.data()

      // const replyRef = data.reply_to ? await data.reply_to.get() : null

      conversationDocs.push({
        objectID: doc.id,
        ...pick(data, conversationFields),
        chat_id: chat.id,
        community_id: chatData.community_id,
      })
    }

    chatDocs.push({
      objectID: chat.id,
      ...pick(chatData, chatFields),
      ...moreInfo,
    })
  }

  try {
    await chatsIndex.saveObjects(chatDocs)
    await chatsIndex.setSettings({
      searchableAttributes: ['member_emails', 'title'],
      ranking: [
        'desc(last_message.created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
      attributesForFaceting: [
        'filterOnly(chat_type)',
        'filterOnly(community_id)',
        'filterOnly(member_emails)',
        'filterOnly(members)',
        'filterOnly(product_id)',
        'filterOnly(shop_id)',
      ],
    })
    console.log('chats imported to algolia')

    await conversationsIndex.saveObjects(conversationDocs)
    await conversationsIndex.setSettings({
      searchableAttributes: ['message'],
      ranking: [
        'desc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
      attributesForFaceting: [
        'filterOnly(chat_id)',
        'filterOnly(community_id)',
        'filterOnly(sender_id)',
      ],
    })
    console.log('conversations imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importChatsAndConversations

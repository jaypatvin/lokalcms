import Chance from 'chance'
import dayjs from 'dayjs'
import { Product, Shop, User } from '../../models'
import db from '../../utils/db'
import hashArrayOfStrings from '../../utils/hashArrayOfStrings'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'

const chance = new Chance()

const seedProductChatsByUser = async ({
  products,
  shops,
  users,
  user,
  admin,
}: {
  products: (Product & { id: string })[]
  shops: (Shop & { id: string })[]
  users: (User & { id: string })[]
  user: User
  admin: AdminType
}) => {
  const randomProducts = chance.pickset(products, chance.integer({ min: 1, max: 5 }))
  for (const product of randomProducts) {
    try {
      const shop = shops.find((shop) => shop.id === product.shop_id)
      const seller = users.find((_user) => _user.id === product.user_id)
      const chatDateInDayJs = dayjs(new Date()).subtract(
        chance.integer({ min: 10, max: 20 }),
        'day'
      )
      const chatDate = admin.firestore.Timestamp.fromDate(chatDateInDayJs.toDate())
      const members = [user.id, product.id, product.shop_id]
      const messageContent = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
      const lastMessage = {
        content: messageContent,
        sender: user.display_name,
        sender_id: user.id,
        created_at: chatDate,
      }
      const hashId = hashArrayOfStrings(members)
      await sleep(100)
      await db.chats.doc(hashId).set({
        title: `${shop.name}: ${product.name}`,
        members,
        community_id: user.community_id,
        archived: false,
        last_message: lastMessage,
        chat_type: 'product',
        shop_id: product.shop_id,
        product_id: product.id,
        created_at: chatDate,
      })

      await sleep(100)
      await db.getChatConversations(`chats/${hashId}/conversation`).add({
        sender_id: user.id,
        sent_at: chatDate,
        archived: false,
        message: messageContent,
        created_at: chatDate,
      })

      const numOfReplies = chance.integer({ min: 1, max: 10 })
      let nextReplyDate = chatDateInDayJs
      let lastMessageRef
      for (let i = 1; i <= numOfReplies; i++) {
        nextReplyDate = nextReplyDate.add(
          chance.integer({ min: 1, max: 10 }),
          chance.pickone(['minute', 'hour'])
        )
        const message = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
        const sender = chance.pickone([user, seller])
        const replyToPrevious = chance.bool()
        await sleep(100)
        const messageData = {
          sender_id: sender.id,
          sent_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
          archived: false,
          message,
          created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
        }
        if (replyToPrevious && lastMessageRef) {
          // @ts-ignore
          messageData.reply_to = lastMessageRef
        }
        const chatMessage = await db
          .getChatConversations(`chats/${hashId}/conversation`)
          .add(messageData)
        await sleep(100)
        await db.chats.doc(hashId).update({
          last_message: {
            ref: db.getChatConversations(`chats/${hashId}/conversation`).doc(chatMessage.id),
            conversation_id: chatMessage.id,
            content: message,
            sender: sender.display_name,
            sender_id: sender.id,
            created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
          },
        })
        lastMessageRef = db.getChatConversations(`chats/${hashId}/conversation`).doc(chatMessage.id)
      }
    } catch (error) {
      console.error('Error creating product chat:', error)
    }
  }
}

const seedShopChatsByUser = async ({
  shops,
  users,
  user,
  admin,
}: {
  shops: (Shop & { id: string })[]
  users: (User & { id: string })[]
  user: User
  admin: AdminType
}) => {
  const randomShops = chance.pickset(shops, chance.integer({ min: 1, max: 3 }))
  for (const shop of randomShops) {
    try {
      const seller = users.find((_user) => _user.id === shop.user_id)
      const chatDateInDayJs = dayjs(new Date()).subtract(
        chance.integer({ min: 10, max: 20 }),
        'day'
      )
      const chatDate = admin.firestore.Timestamp.fromDate(chatDateInDayJs.toDate())
      const members = [user.id, shop.id]
      const messageContent = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
      const lastMessage = {
        content: messageContent,
        sender: user.display_name,
        sender_id: user.id,
        created_at: chatDate,
      }
      const hashId = hashArrayOfStrings(members)
      await sleep(100)
      await db.chats.doc(hashId).set({
        title: shop.name,
        members,
        community_id: user.community_id,
        archived: false,
        last_message: lastMessage,
        chat_type: 'shop',
        shop_id: shop.id,
        created_at: chatDate,
      })

      await sleep(100)
      await db.getChatConversations(`chats/${hashId}/conversation`).add({
        sender_id: user.id,
        sent_at: chatDate,
        archived: false,
        message: messageContent,
        created_at: chatDate,
      })

      const numOfReplies = chance.integer({ min: 1, max: 10 })
      let nextReplyDate = chatDateInDayJs
      let lastMessageRef
      for (let i = 1; i <= numOfReplies; i++) {
        nextReplyDate = nextReplyDate.add(
          chance.integer({ min: 1, max: 10 }),
          chance.pickone(['minute', 'hour'])
        )
        const message = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
        const sender = chance.pickone([user, seller])
        const replyToPrevious = chance.bool()
        await sleep(100)
        const messageData = {
          sender_id: sender.id,
          sent_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
          archived: false,
          message,
          created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
        }
        if (replyToPrevious && lastMessageRef) {
          // @ts-ignore
          messageData.reply_to = lastMessageRef
        }
        const chatMessage = await db
          .getChatConversations(`chats/${hashId}/conversation`)
          .add(messageData)
        await sleep(100)
        await db.chats.doc(hashId).update({
          last_message: {
            ref: db.getChatConversations(`chats/${hashId}/conversation`).doc(chatMessage.id),
            conversation_id: chatMessage.id,
            content: message,
            sender: sender.display_name,
            sender_id: sender.id,
            created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
          },
        })
        lastMessageRef = db.getChatConversations(`chats/${hashId}/conversation`).doc(chatMessage.id)
      }
    } catch (error) {
      console.error('Error creating shop chat:', error)
    }
  }
}

const seedUserChatsByUser = async ({
  users,
  user,
  admin,
}: {
  users: (User & { id: string })[]
  user: User
  admin: AdminType
}) => {
  const randomUsers = chance.pickset(users, chance.integer({ min: 1, max: 3 }))
  for (const otherUser of randomUsers) {
    try {
      const chatDateInDayJs = dayjs(new Date()).subtract(
        chance.integer({ min: 10, max: 20 }),
        'day'
      )
      const chatDate = admin.firestore.Timestamp.fromDate(chatDateInDayJs.toDate())
      const members = [user.id, otherUser.id]
      const messageContent = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
      const lastMessage = {
        content: messageContent,
        sender: user.display_name,
        sender_id: user.id,
        created_at: chatDate,
      }
      const hashId = hashArrayOfStrings(members)
      const chatExists = (await db.chats.doc(hashId).get()).exists
      if (!chatExists) {
        await sleep(100)
        await db.chats.doc(hashId).set({
          title: `${user.display_name}, ${otherUser.display_name}`,
          members,
          community_id: user.community_id,
          archived: false,
          last_message: lastMessage,
          chat_type: 'user',
          created_at: chatDate,
        })

        await sleep(100)
        await db.getChatConversations(`chats/${hashId}/conversation`).add({
          sender_id: user.id,
          sent_at: chatDate,
          archived: false,
          message: messageContent,
          created_at: chatDate,
        })

        const numOfReplies = chance.integer({ min: 1, max: 10 })
        let nextReplyDate = chatDateInDayJs
        let lastMessageRef
        for (let i = 1; i <= numOfReplies; i++) {
          nextReplyDate = nextReplyDate.add(
            chance.integer({ min: 1, max: 10 }),
            chance.pickone(['minute', 'hour'])
          )
          const message = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
          const sender = chance.pickone([user, otherUser])
          const replyToPrevious = chance.bool()
          await sleep(100)
          const messageData = {
            sender_id: sender.id,
            sent_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
            archived: false,
            message,
            created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
          }
          if (replyToPrevious && lastMessageRef) {
            // @ts-ignore
            messageData.reply_to = lastMessageRef
          }
          const chatMessage = await db
            .getChatConversations(`chats/${hashId}/conversation`)
            .add(messageData)
          await sleep(100)
          await db.chats.doc(hashId).update({
            last_message: {
              ref: db.getChatConversations(`chats/${hashId}/conversation`).doc(chatMessage.id),
              conversation_id: chatMessage.id,
              content: message,
              sender: sender.display_name,
              sender_id: sender.id,
              created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
            },
          })
          lastMessageRef = db
            .getChatConversations(`chats/${hashId}/conversation`)
            .doc(chatMessage.id)
        }
      }
    } catch (error) {
      console.error('Error creating user chat:', error)
    }
  }
}

const seedGroupChatsByUser = async ({
  users,
  user,
  admin,
}: {
  users: (User & { id: string })[]
  user: User
  admin: AdminType
}) => {
  const randomUsersArray = [
    chance.pickset(users, chance.integer({ min: 2, max: 10 })),
    chance.pickset(users, chance.integer({ min: 2, max: 10 })),
    chance.pickset(users, chance.integer({ min: 2, max: 10 })),
  ]
  for (const otherUsers of randomUsersArray) {
    try {
      const chatDateInDayJs = dayjs(new Date()).subtract(
        chance.integer({ min: 10, max: 20 }),
        'day'
      )
      const chatDate = admin.firestore.Timestamp.fromDate(chatDateInDayJs.toDate())
      const members = [user.id, ...otherUsers.map(({ id }) => id)]
      const messageContent = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
      const lastMessage = {
        content: messageContent,
        sender: user.display_name,
        sender_id: user.id,
        created_at: chatDate,
      }
      const hashId = hashArrayOfStrings(members)
      const isNew = (await db.chats.where('group_hash', '==', hashId).get()).empty
      if (isNew) {
        await sleep(100)
        const groupChat = await db.chats.add({
          title: `${user.display_name}, ${otherUsers
            .map(({ display_name }) => display_name)
            .join(', ')}`,
          group_hash: hashId,
          members,
          community_id: user.community_id,
          archived: false,
          last_message: lastMessage,
          chat_type: 'group',
          created_at: chatDate,
        })

        await sleep(100)
        await db.getChatConversations(`chats/${groupChat.id}/conversation`).add({
          sender_id: user.id,
          sent_at: chatDate,
          archived: false,
          message: messageContent,
          created_at: chatDate,
        })

        const numOfReplies = chance.integer({ min: 1, max: 10 })
        let nextReplyDate = chatDateInDayJs
        let lastMessageRef
        for (let i = 1; i <= numOfReplies; i++) {
          nextReplyDate = nextReplyDate.add(
            chance.integer({ min: 1, max: 10 }),
            chance.pickone(['minute', 'hour'])
          )
          const message = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
          const sender = chance.pickone([user, ...otherUsers])
          const replyToPrevious = chance.bool()
          await sleep(100)
          const messageData = {
            sender_id: sender.id,
            sent_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
            archived: false,
            message,
            created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
          }
          if (replyToPrevious && lastMessageRef) {
            // @ts-ignore
            messageData.reply_to = lastMessageRef
          }
          const chatMessage = await db
            .getChatConversations(`chats/${groupChat.id}/conversation`)
            .add(messageData)
          await sleep(100)
          await db.chats.doc(groupChat.id).update({
            last_message: {
              ref: db
                .getChatConversations(`chats/${groupChat.id}/conversation`)
                .doc(chatMessage.id),
              conversation_id: chatMessage.id,
              content: message,
              sender: sender.display_name,
              sender_id: sender.id,
              created_at: admin.firestore.Timestamp.fromDate(nextReplyDate.toDate()),
            },
          })
          lastMessageRef = db
            .getChatConversations(`chats/${groupChat.id}/conversation`)
            .doc(chatMessage.id)
        }
      }
    } catch (error) {
      console.error('Error creating user chat:', error)
    }
  }
}

export const seedChats = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await db.shops.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await db.products.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const randomUsers = chance.pickset(users, chance.integer({ min: 10, max: 15 }))
  for (const user of randomUsers) {
    const communityProducts = products.filter(
      (product) => product.community_id === user.community_id
    )
    const communityShops = shops.filter((shop) => shop.community_id === user.community_id)
    const communityUsers = users.filter(
      (_user) => _user.community_id === user.community_id && _user.id !== user.id
    )
    await seedProductChatsByUser({
      users,
      shops,
      products: communityProducts,
      user,
      admin,
    })
    await seedShopChatsByUser({
      users,
      shops: communityShops,
      user,
      admin,
    })
    await seedUserChatsByUser({
      users: communityUsers,
      user,
      admin,
    })
    await seedGroupChatsByUser({
      users: communityUsers,
      user,
      admin,
    })
  }
}

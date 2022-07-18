import Chance from 'chance'
import dayjs from 'dayjs'
import {
  setDoc,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { Product, Shop, User } from '../../models'
import db from '../../utils/db'
import hashArrayOfStrings from '../../utils/hashArrayOfStrings'
import sleep from '../../utils/sleep'

const chance = new Chance()

const seedProductChatsByUser = async ({
  products,
  shops,
  users,
  user,
}: {
  products: (Product & { id: string })[]
  shops: (Shop & { id: string })[]
  users: (User & { id: string })[]
  user: User & { id: string }
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
      const chatDate = Timestamp.fromDate(chatDateInDayJs.toDate())
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
      await setDoc(doc(db.chats, hashId), {
        title: `${shop!.name}: ${product.name}`,
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
      await addDoc(db.getChatConversations(`chats/${hashId}/conversation`), {
        sender_id: user.id,
        sent_at: chatDate,
        archived: false,
        message: messageContent,
        created_at: chatDate,
        community_id: user.community_id,
        chat_id: hashId,
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
          sender_id: sender!.id,
          sent_at: Timestamp.fromDate(nextReplyDate.toDate()),
          archived: false,
          message,
          created_at: Timestamp.fromDate(nextReplyDate.toDate()),
          community_id: sender!.community_id,
          chat_id: hashId,
        }
        if (replyToPrevious && lastMessageRef) {
          // @ts-ignore
          messageData.reply_to = lastMessageRef
        }

        const chatMessage = await addDoc(
          db.getChatConversations(`chats/${hashId}/conversation`),
          messageData
        )
        await sleep(100)
        await updateDoc(doc(db.chats, hashId), {
          last_message: {
            ref: doc(db.getChatConversations(`chats/${hashId}/conversation`), chatMessage.id),
            conversation_id: chatMessage.id,
            content: message,
            sender: sender!.display_name,
            sender_id: sender!.id,
            created_at: Timestamp.fromDate(nextReplyDate.toDate()),
          },
        })
        lastMessageRef = doc(
          db.getChatConversations(`chats/${hashId}/conversation`),
          chatMessage.id
        )
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
}: {
  shops: (Shop & { id: string })[]
  users: (User & { id: string })[]
  user: User & { id: string }
}) => {
  const randomShops = chance.pickset(shops, chance.integer({ min: 1, max: 3 }))
  for (const shop of randomShops) {
    try {
      const seller = users.find((_user) => _user.id === shop.user_id)
      const chatDateInDayJs = dayjs(new Date()).subtract(
        chance.integer({ min: 10, max: 20 }),
        'day'
      )
      const chatDate = Timestamp.fromDate(chatDateInDayJs.toDate())
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
      await setDoc(doc(db.chats, hashId), {
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
      await addDoc(db.getChatConversations(`chats/${hashId}/conversation`), {
        sender_id: user.id,
        sent_at: chatDate,
        archived: false,
        message: messageContent,
        created_at: chatDate,
        community_id: user.community_id,
        chat_id: hashId,
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
          sender_id: sender!.id,
          sent_at: Timestamp.fromDate(nextReplyDate.toDate()),
          archived: false,
          message,
          created_at: Timestamp.fromDate(nextReplyDate.toDate()),
          community_id: sender!.community_id,
          chat_id: hashId,
        }
        if (replyToPrevious && lastMessageRef) {
          // @ts-ignore
          messageData.reply_to = lastMessageRef
        }
        const chatMessage = await addDoc(
          db.getChatConversations(`chats/${hashId}/conversation`),
          messageData
        )
        await sleep(100)
        await updateDoc(doc(db.chats, hashId), {
          last_message: {
            ref: doc(db.getChatConversations(`chats/${hashId}/conversation`), chatMessage.id),
            conversation_id: chatMessage.id,
            content: message,
            sender: sender!.display_name,
            sender_id: sender!.id,
            created_at: Timestamp.fromDate(nextReplyDate.toDate()),
          },
        })
        lastMessageRef = doc(
          db.getChatConversations(`chats/${hashId}/conversation`),
          chatMessage.id
        )
      }
    } catch (error) {
      console.error('Error creating shop chat:', error)
    }
  }
}

const seedUserChatsByUser = async ({
  users,
  user,
}: {
  users: (User & { id: string })[]
  user: User & { id: string }
}) => {
  const randomUsers = chance.pickset(users, chance.integer({ min: 1, max: 3 }))
  for (const otherUser of randomUsers) {
    try {
      const chatDateInDayJs = dayjs(new Date()).subtract(
        chance.integer({ min: 10, max: 20 }),
        'day'
      )
      const chatDate = Timestamp.fromDate(chatDateInDayJs.toDate())
      const members = [user.id, otherUser.id]
      const messageContent = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
      const lastMessage = {
        content: messageContent,
        sender: user.display_name,
        sender_id: user.id,
        created_at: chatDate,
      }
      const hashId = hashArrayOfStrings(members)
      const chatExists = (await getDoc(doc(db.chats, hashId))).exists()
      if (!chatExists) {
        await sleep(100)
        await setDoc(doc(db.chats, hashId), {
          title: `${user.display_name}, ${otherUser.display_name}`,
          members,
          community_id: user.community_id,
          archived: false,
          last_message: lastMessage,
          chat_type: 'user',
          created_at: chatDate,
        })

        await sleep(100)
        await addDoc(db.getChatConversations(`chats/${hashId}/conversation`), {
          sender_id: user.id,
          sent_at: chatDate,
          archived: false,
          message: messageContent,
          created_at: chatDate,
          community_id: user.community_id,
          chat_id: hashId,
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
            sent_at: Timestamp.fromDate(nextReplyDate.toDate()),
            archived: false,
            message,
            created_at: Timestamp.fromDate(nextReplyDate.toDate()),
            community_id: sender.community_id,
            chat_id: hashId,
          }
          if (replyToPrevious && lastMessageRef) {
            // @ts-ignore
            messageData.reply_to = lastMessageRef
          }
          const chatMessage = await addDoc(
            db.getChatConversations(`chats/${hashId}/conversation`),
            messageData
          )
          await sleep(100)
          await updateDoc(doc(db.chats, hashId), {
            last_message: {
              ref: doc(db.getChatConversations(`chats/${hashId}/conversation`), chatMessage.id),
              conversation_id: chatMessage.id,
              content: message,
              sender: sender!.display_name,
              sender_id: sender!.id,
              created_at: Timestamp.fromDate(nextReplyDate.toDate()),
            },
          })
          lastMessageRef = doc(
            db.getChatConversations(`chats/${hashId}/conversation`),
            chatMessage.id
          )
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
}: {
  users: (User & { id: string })[]
  user: User & { id: string }
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
      const chatDate = Timestamp.fromDate(chatDateInDayJs.toDate())
      const members = [user.id, ...otherUsers.map(({ id }) => id)]
      const messageContent = chance.sentence({ words: chance.integer({ min: 1, max: 20 }) })
      const lastMessage = {
        content: messageContent,
        sender: user.display_name,
        sender_id: user.id,
        created_at: chatDate,
      }
      const hashId = hashArrayOfStrings(members)
      const isNew = (await getDocs(query(db.chats, where('group_hash', '==', hashId)))).empty
      if (isNew) {
        await sleep(100)
        const groupChat = await addDoc(db.chats, {
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
        await addDoc(db.getChatConversations(`chats/${groupChat.id}/conversation`), {
          sender_id: user.id,
          sent_at: chatDate,
          archived: false,
          message: messageContent,
          created_at: chatDate,
          community_id: user.community_id,
          chat_id: groupChat.id,
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
            sent_at: Timestamp.fromDate(nextReplyDate.toDate()),
            archived: false,
            message,
            created_at: Timestamp.fromDate(nextReplyDate.toDate()),
            community_id: sender.community_id,
            chat_id: groupChat.id,
          }
          if (replyToPrevious && lastMessageRef) {
            // @ts-ignore
            messageData.reply_to = lastMessageRef
          }
          const chatMessage = await addDoc(
            db.getChatConversations(`chats/${groupChat.id}/conversation`),
            messageData
          )
          await sleep(100)
          await updateDoc(doc(db.chats, groupChat.id), {
            last_message: {
              ref: doc(
                db.getChatConversations(`chats/${groupChat.id}/conversation`),
                chatMessage.id
              ),
              conversation_id: chatMessage.id,
              content: message,
              sender: sender!.display_name,
              sender_id: sender!.id,
              created_at: Timestamp.fromDate(nextReplyDate.toDate()),
            },
          })
          lastMessageRef = doc(
            db.getChatConversations(`chats/${groupChat.id}/conversation`),
            chatMessage.id
          )
        }
      }
    } catch (error) {
      console.error('Error creating user chat:', error)
    }
  }
}

export const seedChats = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const shops = (await getDocs(db.shops)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const products = (await getDocs(db.products)).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
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
    })
    await seedShopChatsByUser({
      users,
      shops: communityShops,
      user,
    })
    await seedUserChatsByUser({
      users: communityUsers,
      user,
    })
    await seedGroupChatsByUser({
      users: communityUsers,
      user,
    })
  }
}

import { Request, Response } from 'express'
import { difference } from 'lodash'
import {
  UsersService,
  ShopsService,
  ChatsService,
  ProductsService,
  ChatMessageService,
} from '../../../service'
import validateFields from '../../../utils/validateFields'
import { required_fields } from './index'
import hashArrayOfStrings from '../../../utils/hashArrayOfStrings'
import { fieldIsNum } from '../../../utils/helpers'
import { db } from '../index'

/**
 * @openapi
 * /v1/chats:
 *   post:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### If 1-to-1/shop/product chat, the document ID of the chat to be created will be the hash of the members field, and will be the same regardless of order.
 *       ### If group chat, the document ID is the default provided by firestore, but will have additional field group_hash which is the hash of the current members field.
 *       ### If a chat document with id or group_hash same as the hash does not exist yet, it will be created.
 *       ### Otherwise, there will be just new entry on the conversation field of the chat document.
 *       # Examples
 *       ## User _user-id-1_ chatting with user _user-id-2_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "user-id-2"],
 *         "message": "Hello there."
 *       }
 *       ```
 *
 *       ## User _user-id-1_ creating a group chat with users _user-id-2_ and _user-id-3_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "user-id-2", "user-id-3"],
 *         "message": "Hello there group."
 *       }
 *       ```
 *
 *       ## User _user-id-2_ replying to _chat-conversation-id_
 *       ```
 *       {
 *         "user_id": "user-id-2",
 *         "members": ["user-id-1", "user-id-2", "user-id-3"],
 *         "message": "This is my reply",
 *         "reply_to": "chat-conversation-id"
 *       }
 *       ```
 *
 *       ## User _user-id-1_ starting a group chat with users _user-id-2_ and _user-id-3_ with custom title
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "user-id-2", "user-id-3"],
 *         "title": "Peaky Blinders",
 *         "message": "Hello there."
 *       }
 *       ```
 *
 *       ## User _user-id-1_ chatting with shop _shop-id-1
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "shop-id-1"],
 *         "message": "Hello there shop.",
 *         "shop_id": "shop-id-1"
 *       }
 *       ```
 *
 *       ## User _user-id-1_ chatting about specific product _product-id-1_ of shop _shop-id-1_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "shop-id-1", "product-id-1"],
 *         "message": "Hello there shop.",
 *         "shop_id": "shop-id-1",
 *         "product_id": "product-id-1"
 *       }
 *       ```
 *
 *       ## User _user-id-1_ chatting about specific product _product-id-1_ of shop _shop-id-1_ with image
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "shop-id-1", "product-id-1"],
 *         "message": "This cake doesn't taste good.",
 *         "media": [
 *           {
 *             "type": "image",
 *             "url": "https://image.shutterstock.com/image-vector/sample-stamp-grunge-texture-vector-260nw-1389188336.jpg",
 *             "order": 1
 *           }
 *         ],
 *         "shop_id": "shop-id-1",
 *         "product_id": "product-id-1"
 *       }
 *       ```
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: Document id of the user sending the message. If not provided, this will be extracted from the firebase token
 *               members:
 *                 type: array
 *                 description: Document ids that are included on the chat. See examples.
 *                 items:
 *                   type: string
 *                   description: Document id of user, shop, or product
 *               title:
 *                 type: string
 *                 description: This will be only used when there is no chat document yet, as the initial title of the created chat.
 *               shop_id:
 *                 type: string
 *                 description: Document id of the shop if talking to the shop.
 *               product_id:
 *                 type: string
 *                 description: Document id of the product if talking about the specific product with the shop owner
 *               reply_to:
 *                 type: string
 *                 description: Document id of the conversation subcollection
 *               message:
 *                 type: string
 *                 description: The message wants to send. Can be blank if the media field have data
 *               media:
 *                 type: array
 *                 description: Array of objects containing the media. Similar to the gallery field of the product documents.
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [image, audio, video]
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: The new chat message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 */
const createChat = async (req: Request, res: Response) => {
  const data = req.body
  const { user_id, chat_id, members, title, shop_id, product_id, message, media, reply_to } = data
  let requestorDocId = res.locals.userDoc.id
  let requestorName = res.locals.userDoc.display_name
  let requestorCommunityId = res.locals.userDoc.community_id
  const isGroup = members.length >= 3 && !shop_id && !product_id
  let chat
  let shop
  let product
  let chatId

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (chat_id) {
    chat = await ChatsService.getChatById(chat_id)
    if (!chat) {
      return res
        .status(400)
        .json({ status: 'error', message: `chat with id ${chat_id} does not exist` })
    }
    const diff = difference(chat.members, members)
    if (diff.length) {
      return res.status(400).json({
        status: 'error',
        message: 'members does not match the members on the existing chat',
      })
    }
    chatId = chat_id
  }

  if (!requestorDocId || !requestorCommunityId) {
    if (user_id) {
      const user = await UsersService.getUserByID(user_id)
      requestorDocId = user.id
      requestorName = user.display_name
      requestorCommunityId = user.community_id
    } else {
      return res.status(400).json({ status: 'error', message: 'Sender information is missing' })
    }
  }

  if (shop_id) {
    shop = await ShopsService.getShopByID(shop_id)
    if (!shop) {
      return res
        .status(400)
        .json({ status: 'error', message: `shop with id ${shop_id} does not exist` })
    }
  }

  if (product_id) {
    product = await ProductsService.getProductByID(shop_id)
    if (!product) {
      return res
        .status(400)
        .json({ status: 'error', message: `product with id ${product_id} does not exist` })
    }
  }

  if (!members.includes(requestorDocId) && (!shop || shop.user_id !== requestorDocId)) {
    return res
      .status(400)
      .json({ status: 'error', message: 'The requestor is not a member of the chat' })
  }

  let messageMedia
  if (media) {
    if (!Array.isArray(media))
      return res.status(400).json({
        status: 'error',
        message: 'Media is not an array of type object: {url: string, order: number, type: string}',
      })

    for (let [i, g] of media.entries()) {
      if (!g.url)
        return res.status(400).json({ status: 'error', message: 'Missing media url for item ' + i })
      if (!g.type)
        return res.status(400).json({ status: 'error', message: 'Missing type for item ' + i })

      if (!fieldIsNum(g.order))
        return res
          .status(400)
          .json({ status: 'error', message: 'order is not a type of number for item ' + i })
    }

    messageMedia = media
  }

  if (!message && !messageMedia)
    return res.status(400).json({ status: 'error', message: 'Message or media is missing.' })

  const last_message: any = {}
  let content = message
  if (media && !content) {
    const numOfMedia = media.length
    if (media[0].type === 'image') {
      content = `sent ${media.length} photo${numOfMedia > 1 ? 's' : ''}`
    } else if (media[0].type === 'video') {
      content = `sent ${media.length} video${numOfMedia > 1 ? 's' : ''}`
    } else if (media[0].type === 'audio') {
      content = `sent an audio`
    } else {
      content = 'sent a message'
    }
  }
  last_message.content = content
  last_message.sender = requestorName
  last_message.created_at = new Date()

  const hashId = hashArrayOfStrings(members)
  if (!chat) chat = await ChatsService.getGroupChatByHash(hashId)
  if (!chat) chat = await ChatsService.getChatById(hashId)
  if (!chat) {
    let chatType = 'user'
    let newChatTitle = title
    let customerName
    let groupHash
    if (shop) {
      customerName = requestorName
      newChatTitle = shop.name
      chatType = 'shop'
    }
    if (shop && product) {
      customerName = requestorName
      newChatTitle += `: ${product.name}`
      chatType = 'product'
    }
    if (!shop && !product && !newChatTitle) {
      if (isGroup) {
        chatType = 'group'
        groupHash = hashId
      }
      const member_names = []
      for (let i = 0; i < members.length; i++) {
        const user = await UsersService.getUserByID(members[i])
        if (!user) {
          return res
            .status(400)
            .json({ status: 'error', message: `User with id ${members[i]} is not found` })
        }
        member_names.push(user.display_name)
      }
      newChatTitle = member_names.join(', ')
    }
    const newChat: any = {
      title: newChatTitle,
      members,
      community_id: requestorCommunityId,
      archived: false,
      last_message,
      chat_type: chatType,
    }
    if (shop_id) newChat.shop_id = shop_id
    if (product_id) newChat.product_id = product_id
    if (customerName) newChat.customer_name = customerName
    if (groupHash && chatType === 'group') {
      newChat.group_hash = groupHash
      chat = await ChatsService.createChat(newChat)
      chatId = chat.id
    } else {
      chat = await ChatsService.createChatWithHashId(hashId, newChat)
      chatId = hashId
    }
  } else {
    chatId = chat.id
    await ChatsService.updateChat(chatId, { last_message })
  }

  const chatMessage: any = {
    sender_id: requestorDocId,
    sent_at: new Date(),
    archived: false,
  }

  if (message) chatMessage.message = message
  if (messageMedia) chatMessage.media = media
  if (reply_to) chatMessage.reply_to = db.doc(`chats/${chatId}/conversation/${reply_to}`)

  const result = await ChatMessageService.createChatMessage(chatId, chatMessage)

  return res.json({ status: 'ok', data: { chat_id: chatId, ...result } })
}

export default createChat

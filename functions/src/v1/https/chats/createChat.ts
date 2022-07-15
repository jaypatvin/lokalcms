import { RequestHandler } from 'express'
import { Timestamp } from 'firebase/firestore'
import {
  UsersService,
  ShopsService,
  ChatsService,
  ProductsService,
  ChatMessageService,
} from '../../../service'
import hashArrayOfStrings from '../../../utils/hashArrayOfStrings'
import { ChatCreateData } from '../../../models/Chat'
import { ConversationCreateData } from '../../../models/Conversation'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

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
 *       ### Otherwise, it will return an error indicating there is already an existing chat with the members.
 *       ### It is required to have a message or media field as this will be the first content of the chat.
 *       ## Note: The user_id field will only be used when the requestor data is not found (from token). By default, user_id is the requestor's user document id.
 *       # Examples
 *       ## User _user-id-1_ starting a chat with user _user-id-2_
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
 *       ## User _user-id-1_ starting a chat with shop _shop-id-1
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "shop-id-1"],
 *         "shop_id": "shop-id-1",
 *         "message": "Hello there shop."
 *       }
 *       ```
 *
 *       ## User _user-id-1_ starting a chat about specific product _product-id-1_ of shop _shop-id-1_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "shop-id-1", "product-id-1"],
 *         "shop_id": "shop-id-1",
 *         "product_id": "product-id-1",
 *         "message": "Is this product available?"
 *       }
 *       ```
 *
 *       ## User _user-id-1_ starting a chat about specific product _product-id-1_ of shop _shop-id-1_ with image
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
 *
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
 *                 required: true
 *                 description: Document ids that are included on the chat. See examples.
 *                 items:
 *                   type: string
 *                   required: true
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
 *         description: The new chat document
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 */
const createChat: RequestHandler = async (req, res) => {
  const data = req.body
  const { user_id, members, title, shop_id, product_id, message, media } = data
  let requestorDocId = res.locals.userDoc.id
  let requestorName = res.locals.userDoc.display_name
  let requestorCommunityId = res.locals.userDoc.community_id
  const isGroup = members.length >= 3 && !shop_id && !product_id
  let chat
  let shop
  let product
  let chatId

  if (!requestorDocId || !requestorCommunityId) {
    if (user_id) {
      const user = await UsersService.findById(user_id)
      if (!user) {
        throw generateNotFoundError(ErrorCode.ChatApiError, 'User', user_id)
      }
      requestorDocId = user.id
      requestorName = user.display_name
      requestorCommunityId = user.community_id
    } else {
      throw generateError(ErrorCode.ChatApiError, {
        message: 'Sender information is missing',
      })
    }
  }

  if (shop_id) {
    shop = await ShopsService.findById(shop_id)
    if (!shop) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'Shop', shop_id)
    }
  }

  if (product_id) {
    product = await ProductsService.findById(product_id)
    if (!product) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'Product', product_id)
    }
  }

  if (!members.includes(requestorDocId) && (!shop || shop.user_id !== requestorDocId)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'The requestor is not a member of the chat',
    })
  }

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
  last_message.sender_id = requestorDocId
  last_message.created_at = new Date()

  const hashId = hashArrayOfStrings(members)
  chat = await ChatsService.findGroupChatByHash(hashId)
  if (!chat) chat = await ChatsService.findById(hashId)
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
      const member_names: string[] = []
      for (let i = 0; i < members.length; i++) {
        const user = await UsersService.findById(members[i])
        if (!user) {
          throw generateNotFoundError(ErrorCode.ChatApiError, 'User', members[i])
        }
        member_names.push(user.display_name)
      }
      newChatTitle = member_names.join(', ')
    }
    const newChat: ChatCreateData = {
      title: newChatTitle,
      members,
      community_id: requestorCommunityId,
      archived: false,
      last_message,
      chat_type: chatType as ChatCreateData['chat_type'],
    }
    if (shop_id) newChat.shop_id = shop_id
    if (product_id) newChat.product_id = product_id
    if (customerName) newChat.customer_name = customerName
    if (groupHash && chatType === 'group') {
      newChat.group_hash = groupHash
      chat = await ChatsService.create(newChat)
      chatId = chat.id
    } else {
      chat = await ChatsService.createChatWithHashId(hashId, newChat)
      chatId = hashId
    }
  } else {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'The chat already exists',
    })
  }

  const chatMessage: ConversationCreateData = {
    sender_id: requestorDocId,
    sent_at: Timestamp.now(),
    archived: false,
    community_id: chat.community_id,
    chat_id: chat.id,
  }

  if (message) chatMessage.message = message
  if (media) chatMessage.media = media

  await ChatMessageService.create(chatId, chatMessage)

  return res.json({ status: 'ok', data: chat })
}

export default createChat

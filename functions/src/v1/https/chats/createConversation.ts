import { RequestHandler } from 'express'
import { serverTimestamp } from 'firebase/firestore'
import { ConversationCreateData } from '../../../models/Conversation'
import {
  UsersService,
  ShopsService,
  ChatsService,
  ProductsService,
  ChatMessageService,
} from '../../../service'
import db from '../../../utils/db'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/chats/{chatId}/conversation:
 *   post:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: document id of the chat
 *         schema:
 *           type: string
 *     description: |
 *       ### Add new conversation document to the chat
 *       # Examples
 *       ## User _user-id-1_ chatting in the _chat-id-1_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "message": "Hello there."
 *       }
 *       ```
 *
 *       ## User _user-id-2_ replying to _chat-conversation-id_ in the _chat-id-1_
 *       ```
 *       {
 *         "user_id": "user-id-2",
 *         "message": "This is my reply",
 *         "reply_to": "chat-conversation-id"
 *       }
 *       ```
 *
 *       ## User _user-id-1_ creating a new message with an image in _chat-id-1_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "message": "This cake doesn't taste good.",
 *         "media": [
 *           {
 *             "type": "image",
 *             "url": "https://image.shutterstock.com/image-vector/sample-stamp-grunge-texture-vector-260nw-1389188336.jpg",
 *             "order": 1
 *           }
 *         ]
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
const createConversation: RequestHandler = async (req, res) => {
  const data = req.body
  const { user_id, message, media, reply_to } = data
  const { chatId } = req.params
  let requestorDocId = res.locals.userDoc.id
  let requestorName = res.locals.userDoc.display_name
  let requestorCommunityId = res.locals.userDoc.community_id
  let shop
  let product

  let chat = await ChatsService.getChatById(chatId)
  if (!chat) {
    throw generateNotFoundError(ErrorCode.ChatApiError, 'Chat', chatId)
  }

  if (!requestorDocId || !requestorCommunityId) {
    if (user_id) {
      const user = await UsersService.getUserByID(user_id)
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

  if (chat.shop_id) {
    shop = await ShopsService.getShopByID(chat.shop_id)
    if (!shop) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'Shop', chat.shop_id)
    }
  }

  if (chat.product_id) {
    product = await ProductsService.getProductByID(chat.product_id)
    if (!product) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'Product', chat.product_id)
    }
  }

  if (!chat.members.includes(requestorDocId) && (!shop || shop.user_id !== requestorDocId)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'The requestor is not a member of the chat',
    })
  }

  const chatMessage: ConversationCreateData = {
    sender_id: requestorDocId,
    sent_at:serverTimestamp(),
    archived: false,
    chat_id: chat.id,
    community_id: chat.community_id,
  }

  if (message) chatMessage.message = message
  if (media) chatMessage.media = media
  if (reply_to) {
    chatMessage.reply_to = db.getChatConversations(`chats/${chatId}/conversation`).doc(reply_to)
  }

  const result = await ChatMessageService.createChatMessage(chatId, chatMessage)

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
  last_message.ref = db.getChatConversations(`chats/${chatId}/conversation`).doc(result.id)
  last_message.conversation_id = result.id
  last_message.content = content
  last_message.sender = requestorName
  last_message.sender_id = requestorDocId
  last_message.created_at =serverTimestamp()

  await ChatsService.updateChat(chatId, { last_message })

  return res.json({ status: 'ok', data: { chatId, ...result } })
}

export default createConversation

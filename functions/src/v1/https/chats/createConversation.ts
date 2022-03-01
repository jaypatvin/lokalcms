import { Request, Response } from 'express'
import { firestore } from 'firebase-admin'
import { ConversationCreateData } from '../../../models/Conversation'
import {
  UsersService,
  ShopsService,
  ChatsService,
  ProductsService,
  ChatMessageService,
} from '../../../service'
import db from '../../../utils/db'

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
const createConversation = async (req: Request, res: Response) => {
  const data = req.body
  const { user_id, message, media, reply_to } = data
  const { chatId } = req.params
  let requestorDocId = res.locals.userDoc.id
  let requestorName = res.locals.userDoc.display_name
  let requestorCommunityId = res.locals.userDoc.community_id
  let chat
  let shop
  let product

  if (!chatId) {
    return res.status(400).json({ status: 'error', message: 'chatId is required.' })
  }

  chat = await ChatsService.getChatById(chatId)
  if (!chat) {
    return res
      .status(400)
      .json({ status: 'error', message: `chat with id ${chatId} does not exist` })
  }

  if (!requestorDocId || !requestorCommunityId) {
    if (user_id) {
      const user = await UsersService.getUserByID(user_id)
      if (!user) {
        return res
          .status(400)
          .json({ status: 'error', message: `User with user_id ${user_id} does not exist` })
      }
      requestorDocId = user.id
      requestorName = user.display_name
      requestorCommunityId = user.community_id
    } else {
      return res.status(400).json({ status: 'error', message: 'Sender information is missing' })
    }
  }

  if (chat.shop_id) {
    shop = await ShopsService.getShopByID(chat.shop_id)
    if (!shop) {
      return res
        .status(400)
        .json({ status: 'error', message: `shop with id ${chat.shop_id} does not exist` })
    }
  }

  if (chat.product_id) {
    product = await ProductsService.getProductByID(chat.product_id)
    if (!product) {
      return res
        .status(400)
        .json({ status: 'error', message: `product with id ${chat.product_id} does not exist` })
    }
  }

  if (!chat.members.includes(requestorDocId) && (!shop || shop.user_id !== requestorDocId)) {
    return res
      .status(400)
      .json({ status: 'error', message: 'The requestor is not a member of the chat' })
  }

  if (!message && !media)
    return res.status(400).json({ status: 'error', message: 'Message or media is missing.' })

  const chatMessage: ConversationCreateData = {
    sender_id: requestorDocId,
    sent_at: firestore.Timestamp.now(),
    archived: false,
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
  last_message.created_at = firestore.Timestamp.now()

  await ChatsService.updateChat(chatId, { last_message })

  return res.json({ status: 'ok', data: { chatId, ...result } })
}

export default createConversation

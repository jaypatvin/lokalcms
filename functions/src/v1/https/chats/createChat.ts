import { Request, Response } from 'express'
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

/**
 * @openapi
 * /v1/chats:
 *   post:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       The document ID of the chat to be created will be the hash of the members field, and will be the same regardless of order.
 *       If a chat document with the hash id does not exist yet, it will be created.
 *       Otherwise, there will be just new entry on the conversation field of the chat document
 *       # Examples
 *       ## User _user-id-1_ chatting with users _user-id-2_ and _user-id-3_
 *       ```
 *       {
 *         "user_id": "user-id-1",
 *         "members": ["user-id-1", "user-id-2", "user-id-3"],
 *         "message": "Hello there."
 *       }
 *       ```
 *
 *       ## User _user-id-1_ starting a chat with users _user-id-2_ and _user-id-3_ with custom title
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
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *               title:
 *                 type: string
 *               shop_id:
 *                 type: string
 *               product_id:
 *                 type: string
 *               message:
 *                 type: string
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: The new chat
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
const createChat = async (req: Request, res: Response) => {
  const data = req.body
  const { user_id, members, title, shop_id, product_id, message, media } = data
  let requestorDocId = res.locals.userDocId
  let requestorCommunityId = res.locals.userCommunityId

  const error_fields = validateFields(data, required_fields)
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  if (!requestorDocId || !requestorCommunityId) {
    if (user_id) {
      const user = await UsersService.getUserByID(user_id)
      requestorDocId = user.id
      requestorCommunityId = user.community_id
    } else {
      return res.status(400).json({ status: 'error', message: 'Sender information is missing' })
    }
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

  const chatId = hashArrayOfStrings(members)
  let chat = await ChatsService.getChatById(chatId)
  if (!chat) {
    let newChatTitle = title
    if (shop_id) {
      const shop = await ShopsService.getShopByID(shop_id)
      newChatTitle = shop.name
    }
    if (shop_id && product_id) {
      const product = await ProductsService.getProductByID(product_id)
      newChatTitle += `: ${product.name}`
    }
    if (!shop_id && !product_id && !newChatTitle) {
      const member_names = []
      for (let i = 0; i < members.length; i++) {
        const user = await UsersService.getUserByID(members[i])
        member_names.push(user.display_name)
      }
      newChatTitle = member_names.join(', ')
    }
    const newChat: any = {
      title: newChatTitle,
      members,
      community_id: requestorCommunityId,
      archived: false,
    }
    if (shop_id) newChat.shop_id = shop_id
    if (product_id) newChat.product_id = product_id
    chat = await ChatsService.createChat(newChat)
  }

  const chatMessage: any = {
    sender_id: requestorDocId,
    sent_at: new Date(),
    archived: false,
  }

  if (message) chatMessage.message = message
  if (messageMedia) chatMessage.media = media

  const result = await ChatMessageService.createChatMessage(chatId, chatMessage)

  return res.json({ status: 'ok', data: result })
}

export default createChat

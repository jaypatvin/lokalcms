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

/**
 * @openapi
 * /v1/chats:
 *   post:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: Create chat
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
    user_id: requestorDocId,
    message,
    sent_at: new Date(),
    archived: false,
  }

  const result = await ChatMessageService.createChatMessage(chatId, chatMessage)

  return res.json({ status: 'ok', data: result })
}

export default createChat

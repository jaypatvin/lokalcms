import { Request, Response } from 'express'
import { includes } from 'lodash'
import { ChatsService, ProductsService, ShopsService } from '../../../service'
import hashArrayOfStrings from '../../../utils/hashArrayOfStrings'

/**
 * @openapi
 * /v1/getChatByMemberIds:
 *   get:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### Get the chat by member ids or chat id
 *       # Examples
 *       ```
 *       v1/chats?memberIds=userId1&memberIds=userId2
 *       v1/chats?memberIds=userId1&memberIds=userId2&memberIds=userId3
 *       v1/chats?memberIds=userId&memberIds=shopId
 *       v1/chats?memberIds=userId&memberIds=shopId&memberIds=productId
 *       ```
 *
 *     parameters:
 *       - in: query
 *         name: memberIds
 *         schema:
 *           type: array
 *           description: The member ids that are included on the chat.
 *           items:
 *             type: string
 *             description: Document id of user, shop, or product
 *     responses:
 *       200:
 *         description: Single chat
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
const getChatByMemberIds = async (req: Request, res: Response) => {
  const { memberIds } = req.query
  let requestorDocId = res.locals.userDoc.id
  let chat
  let shop
  let product

  if (!memberIds || !memberIds.length) {
    return res.status(400).json({ status: 'error', message: 'memberIds is required.' })
  }

  const hashId = hashArrayOfStrings(memberIds as string[])
  chat = await ChatsService.getGroupChatByHash(hashId)
  if (!chat) chat = await ChatsService.getChatById(hashId)
  if (!chat) {
    return res
      .status(400)
      .json({ status: 'error', message: `chat for members ${memberIds} does not exist.` })
  }

  const chatMembers = chat.members

  if (chat.shop_id) {
    shop = await ShopsService.getShopByID(chat.shop_id)
    if (!shop) {
      return res
        .status(400)
        .json({ status: 'error', message: `shop with id ${chat.shop_id} does not exist` })
    }
    chatMembers.push(shop.user_id)
  }

  if (chat.product_id) {
    product = await ProductsService.getProductByID(chat.product_id)
    if (!product) {
      return res
        .status(400)
        .json({ status: 'error', message: `product with id ${chat.product_id} does not exist` })
    }
    chatMembers.push(product.user_id)
  }

  if (!includes(chatMembers, requestorDocId)) {
    return res
      .status(400)
      .json({
        status: 'error',
        message: `The requestor with document id ${requestorDocId} is not a member of the chat.`,
      })
  }

  return res.json({ status: 'ok', data: chat })
}

export default getChatByMemberIds

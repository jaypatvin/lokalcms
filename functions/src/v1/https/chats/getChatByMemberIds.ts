import { RequestHandler } from 'express'
import { includes } from 'lodash'
import { ChatsService, ProductsService, ShopsService } from '../../../service'
import { generateError, ErrorCode, generateNotFoundError } from '../../../utils/generators'
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
 *       v1/getChatByMemberIds?memberIds=userId1&memberIds=userId2
 *       v1/getChatByMemberIds?memberIds=userId1&memberIds=userId2&memberIds=userId3
 *       v1/getChatByMemberIds?memberIds=userId&memberIds=shopId
 *       v1/getChatByMemberIds?memberIds=userId&memberIds=shopId&memberIds=productId
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
const getChatByMemberIds: RequestHandler = async (req, res) => {
  const { memberIds } = req.query
  let requestorDocId = res.locals.userDoc.id
  let shop
  let product

  if (!memberIds || !memberIds.length) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'memberIds is required',
    })
  }

  const hashId = hashArrayOfStrings(memberIds as string[])
  const chat =
    (await ChatsService.findGroupChatByHash(hashId)) ?? (await ChatsService.findById(hashId))
  if (!chat) {
    throw generateError(ErrorCode.ChatApiError, {
      message: `chat for members ${memberIds} does not exist`,
    })
  }

  const chatMembers = [...chat.members]

  if (chat.shop_id) {
    shop = await ShopsService.findById(chat.shop_id)
    if (!shop) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'Shop', chat.shop_id)
    }
    chatMembers.push(shop.user_id)
  }

  if (chat.product_id) {
    product = await ProductsService.findById(chat.product_id)
    if (!product) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'Product', chat.product_id)
    }
    chatMembers.push(product.user_id)
  }

  if (!includes(chatMembers, requestorDocId)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'The requestor is not a member of the chat',
    })
  }

  return res.json({ status: 'ok', data: chat })
}

export default getChatByMemberIds

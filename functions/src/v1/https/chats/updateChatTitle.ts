import { RequestHandler } from 'express'
import { ChatsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/chats/{chatId}/updateTitle:
 *   put:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: Update the chat title
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: document id of the chat
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Updated chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateChatTitle: RequestHandler = async (req, res) => {
  const data = req.body
  const { title } = data
  const { chatId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const chat = await ChatsService.getChatById(chatId)
  if (!chat) {
    throw generateNotFoundError(ErrorCode.ChatApiError, 'Chat', chatId)
  }

  if (chat.shop_id) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'Cannot update chat title for shop or product',
    })
  }

  if (!roles.admin && !chat.members.includes(requestorDocId)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'You do not have a permission to update the chat title',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    title,
  }

  const result = await ChatsService.updateChat(chat.id, { ...requestData })
  return res.json({ status: 'ok', data: result })
}

export default updateChatTitle

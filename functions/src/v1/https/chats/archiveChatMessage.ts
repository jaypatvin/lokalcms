import { RequestHandler } from 'express'
import { ChatMessageService, ChatsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/chats/{chatId}/conversation/{messageId}:
 *   delete:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: Archive the chat message
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         description: document id of the chat
 *         schema:
 *           type: string
 *       - in: path
 *         name: messageId
 *         required: true
 *         description: document id of the message
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived chat message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const archiveChatMessage: RequestHandler = async (req, res) => {
  const data = req.body
  const { chatId, messageId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const chatMessage = await ChatMessageService.findChatMessage(chatId, messageId)
  if (!chatMessage) {
    throw generateNotFoundError(ErrorCode.ChatApiError, 'Chat Message', messageId)
  }

  if (!roles.admin && requestorDocId !== chatMessage.sender_id) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'User does not have a permission to delete a chat message of another user',
    })
  }

  const chat = await ChatsService.findById(chatId)

  if (chat?.last_message.conversation_id === messageId) {
    // @ts-ignore
    await ChatsService.updateChat(chatId, { 'last_message.content': 'Message deleted' })
  }

  const requestData = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
  }

  const result = await ChatMessageService.archive(chatId, messageId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveChatMessage

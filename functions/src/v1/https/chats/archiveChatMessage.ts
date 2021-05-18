import { Request, Response } from 'express'
import { ChatMessageService } from '../../../service'

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
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 */
const archiveChatMessage = async (req: Request, res: Response) => {
  const data = req.body
  const { chatId, messageId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  const _chatMessage = await ChatMessageService.getChatMessageById(chatId, messageId)

  if (!_chatMessage)
    return res.status(403).json({ status: 'error', message: 'Chat message does not exist!' })

  if (!roles.admin && requestorDocId !== _chatMessage.sender_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await ChatMessageService.archiveChatMessage(chatId, messageId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveChatMessage

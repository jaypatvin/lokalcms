import { Request, Response } from 'express'
import { ChatsService } from '../../../service'

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
 *                 data:
 *                   $ref: '#/components/schemas/Chat'
 */
const updateChatTitle = async (req: Request, res: Response) => {
  const data = req.body
  const { title } = data
  const { chatId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  if (!title) return res.status(403).json({ status: 'error', message: 'title is missing' })

  const _chat = await ChatsService.getChatById(chatId)

  if (!_chat) return res.status(403).json({ status: 'error', message: 'Chat does not exist!' })

  if (_chat.shop_id)
    return res
      .status(403)
      .json({ status: 'error', message: "Can't update chat title for shop or product." })

  if (!roles.admin && !_chat.members.includes(requestorDocId))
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update the chat title',
    })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    title,
  }

  const result = await ChatsService.updateChat(_chat.id, { ...requestData })
  return res.json({ status: 'ok', data: result })
}

export default updateChatTitle

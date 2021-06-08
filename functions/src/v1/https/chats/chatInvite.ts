import { Request, Response } from 'express'
import { ChatsService } from '../../../service'

/**
 * @openapi
 * /v1/chats/{chatId}/invite:
 *   put:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: Invite user/s to the chat
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
 *               new_members:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Updated Chat with new members
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
const chatInvite = async (req: Request, res: Response) => {
  const data = req.body
  const { new_members } = data
  const { chatId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  if (!new_members || !new_members.length) {
    return res.status(403).json({ status: 'error', message: 'new_members field is required.' })
  }

  const _chat = await ChatsService.getChatById(chatId)

  if (!_chat) return res.status(403).json({ status: 'error', message: 'Chat does not exist!' })

  if (_chat.shop_id)
    return res
      .status(403)
      .json({ status: 'error', message: "Can't add another member on chat with a shop" })

  if (!roles.admin && !_chat.members.includes(requestorDocId))
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission invite another user',
    })

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
    members: [..._chat.members, ...new_members],
  }

  const result = await ChatsService.updateChat(_chat.id, { ...requestData })
  return res.json({ status: 'ok', data: result })
}

export default chatInvite

import { Request, Response } from 'express'
import { ChatsService, UsersService } from '../../../service'
import hashArrayOfStrings from '../../../utils/hashArrayOfStrings'

/**
 * @openapi
 * /v1/chats/{chatId}/removeUser:
 *   put:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### Can only be used on group chats
 *       ### Remove a user from the group chat
 *       # Examples
 *       ## Removing _user-id-4_ from the group chat
 *       ```
 *       {
 *         "user_id": "user-id-4"
 *       }
 *       ```
 *
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
 *               user_id:
 *                 type: string
 *                 description: Document id of the user you want to remove from the chat
 *     responses:
 *       200:
 *         description: Chat with updated members
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
const chatRemoveUser = async (req: Request, res: Response) => {
  const data = req.body
  const { user_id } = data
  const { chatId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  if (!user_id) {
    return res.status(403).json({ status: 'error', message: 'user_id field is required.' })
  }

  const _chat = await ChatsService.getChatById(chatId)

  if (!_chat) return res.status(403).json({ status: 'error', message: 'Chat does not exist!' })

  if (_chat.shop_id) {
    return res
      .status(403)
      .json({ status: 'error', message: "Can't update members of chat with shop" })
  }

  if (_chat.members.length === 2 || !_chat.group_hash) {
    return res
      .status(403)
      .json({ status: 'error', message: `Chat with id ${chatId} is not a group chat` })
  }

  if (_chat.members.length === 3) {
    return res
      .status(403)
      .json({ status: 'error', message: 'The minimum number of members on a group chat is 3' })
  }

  if (!_chat.members.includes(user_id)) {
    return res
      .status(403)
      .json({ status: 'error', message: `Chat members does not contain ${user_id}` })
  }

  if (!roles.admin && !_chat.members.includes(requestorDocId))
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to invite another user',
    })

  const members = _chat.members.filter((m) => m !== user_id)
  const group_hash = hashArrayOfStrings(members)
  let title = _chat.title
  const member_names = []
  for (let i = 0; i < members.length; i++) {
    const user = await UsersService.getUserByID(members[i])
    if (!user) {
      return res
        .status(400)
        .json({ status: 'error', message: `User with id ${members[i]} is not found` })
    }
    member_names.push(user.display_name)
  }
  title = member_names.join(', ')

  const requestData = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
    members,
    group_hash,
    title,
  }

  const result = await ChatsService.updateChat(_chat.id, { ...requestData })
  return res.json({ status: 'ok', data: result })
}

export default chatRemoveUser

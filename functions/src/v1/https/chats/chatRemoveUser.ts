import { RequestHandler } from 'express'
import { ChatsService, UsersService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'
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
 */
const chatRemoveUser: RequestHandler = async (req, res) => {
  const data = req.body
  const { user_id } = data
  const { chatId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const chat = await ChatsService.getChatById(chatId)
  if (!chat) {
    throw generateNotFoundError(ErrorCode.ChatApiError, 'Chat', chatId)
  }

  if (chat.shop_id) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'Cannot update members of chat with shop',
    })
  }

  if (chat.members.length === 2 || !chat.group_hash) {
    throw generateError(ErrorCode.ChatApiError, {
      message: `Chat with id ${chatId} is not a group chat`,
    })
  }

  if (chat.members.length === 3) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'The number of members in a group chat cannot be less than 3',
    })
  }

  if (!chat.members.includes(user_id)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: `Chat members does not contain ${user_id}`,
    })
  }

  if (!roles.admin && !chat.members.includes(requestorDocId)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'User does not have a permission to remove another user in a group chat',
    })
  }

  const members = chat.members.filter((m) => m !== user_id)
  const group_hash = hashArrayOfStrings(members)
  let title = chat.title
  const member_names = []
  for (const member of members) {
    const user = await UsersService.getUserByID(member)
    if (!user) {
      throw generateNotFoundError(ErrorCode.ChatApiError, 'User', member)
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

  const result = await ChatsService.updateChat(chat.id, requestData)
  return res.json({ status: 'ok', data: result })
}

export default chatRemoveUser

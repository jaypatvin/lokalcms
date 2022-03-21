import { RequestHandler } from 'express'
import { ChatsService, UsersService } from '../../../service'
import { ErrorCode, generateError, generateNotFoundError } from '../../../utils/generators'
import hashArrayOfStrings from '../../../utils/hashArrayOfStrings'

/**
 * @openapi
 * /v1/chats/{chatId}/invite:
 *   put:
 *     tags:
 *       - chats
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### Can only be used on group chats
 *       ### Can add single user or multiple users at once.
 *       ### Only one of the fields user_id or new_members shall be used.
 *       # Examples
 *       ## Adding _user-id-4_ to the group chat
 *       ```
 *       {
 *         "user_id": "user-id-4"
 *       }
 *       ```
 *
 *       ## Adding _user-id-5_, _user-id-6_, _user-id-7_ to the group chat
 *       ```
 *       {
 *         "new_members": ["user-id-5", "user-id-6", "user-id-7"]
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
 *                 description: Document id of the user that you want to add to the chat. This is used for adding single user, or can be used for 1 by 1, depends on UI logic.
 *               new_members:
 *                 type: array
 *                 description: Document ids of the users you want to add to the chat. This is used for adding bulk users.
 *                 items:
 *                   type: string
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
const chatInvite: RequestHandler = async (req, res) => {
  const data = req.body
  const { user_id, new_members } = data
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

  if (!roles.admin && !chat.members.includes(requestorDocId)) {
    throw generateError(ErrorCode.ChatApiError, {
      message: 'User does not have a permission to invite another user in a group chat',
    })
  }

  let members

  if (user_id) {
    if (chat.members.includes(user_id)) {
      throw generateError(ErrorCode.ChatApiError, {
        message: `User with id ${user_id} is already a member`,
      })
    }
    members = [...chat.members, user_id]
  } else if (new_members) {
    for (const member of new_members) {
      if (chat.members.includes(member)) {
        throw generateError(ErrorCode.ChatApiError, {
          message: `User with id ${user_id} is already a member`,
        })
      }
    }
    members = [...chat.members, ...new_members]
  }
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

export default chatInvite

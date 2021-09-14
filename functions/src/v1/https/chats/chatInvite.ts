import { Request, Response } from 'express'
import { ChatsService, UsersService } from '../../../service'
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
const chatInvite = async (req: Request, res: Response) => {
  const data = req.body
  const { user_id, new_members } = data
  const { chatId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  if (!user_id && (!new_members || !new_members.length)) {
    return res
      .status(403)
      .json({ status: 'error', message: 'user_id or new_members field is required.' })
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

  if (!roles.admin && !_chat.members.includes(requestorDocId))
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to invite another user',
    })

  let members

  if (user_id) {
    if (_chat.members.includes(user_id)) {
      return res
        .status(400)
        .json({ status: 'error', message: `User with id ${user_id} is already a member` })
    }
    members = [..._chat.members, user_id]
  } else if (new_members) {
    for (let i = 0; i < new_members.length; i++) {
      const member = new_members[i]
      if (_chat.members.includes(member)) {
        return res
          .status(400)
          .json({ status: 'error', message: `User with id ${member} is already a member` })
      }
    }
    members = [..._chat.members, ...new_members]
  }
  const group_hash = hashArrayOfStrings(members)
  let title = _chat.title
  const member_names = []
  for (let i = 0; i < members.length; i++) {
    const member = members[i]
    const user = await UsersService.getUserByID(member)
    if (!user) {
      return res
        .status(400)
        .json({ status: 'error', message: `User with id ${member} is not found` })
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

export default chatInvite

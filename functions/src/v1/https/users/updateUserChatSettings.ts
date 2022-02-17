import { Request, Response } from 'express'
import { isBoolean } from 'lodash'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/chatSettings:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### Update the chat_settings field of the user document
 *       # Examples
 *       ## set show_read_receipts to true
 *       ```
 *       {
 *         "show_read_receipts": true
 *       }
 *       ```
 *
 *       ## set show_read_receipts to false
 *       ```
 *       {
 *         "show_read_receipts": false
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               show_read_receipts:
 *                 type: boolean
 */
const updateUserChatSettings = async (req: Request, res: Response) => {
  const { userId } = req.params
  const { show_read_receipts, source } = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== userId) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update another user',
    })
  }

  const existingUser = await UsersService.getUserByID(userId)
  if (!existingUser) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const updateData: any = {
    updated_by: requestorDocId || '',
    updated_from: source || '',
  }

  const newChatSettings = existingUser.chat_settings || {}

  if (isBoolean(show_read_receipts)) newChatSettings.show_read_receipts = show_read_receipts

  updateData.chat_settings = newChatSettings

  const result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateUserChatSettings

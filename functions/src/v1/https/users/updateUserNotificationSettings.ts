import { Request, Response } from 'express'
import { isBoolean } from 'lodash'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/notificationSettings:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### Update the notification_settings field of the user document
 *       # Examples
 *       ## set likes to true
 *       ```
 *       {
 *         "likes": true
 *       }
 *       ```
 *
 *       ## set tags to false
 *       ```
 *       {
 *         "tags": false
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
 *               likes:
 *                 type: boolean
 *               comments:
 *                 type: boolean
 *               tags:
 *                 type: boolean
 *               messages:
 *                 type: boolean
 *               order_status:
 *                 type: boolean
 *               community_alerts:
 *                 type: boolean
 */
const updateUserNotificationSettings = async (req: Request, res: Response) => {
  const { userId } = req.params
  const { likes, comments, tags, messages, order_status, community_alerts, source } = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== userId)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update another user',
    })

  if (!userId) return res.status(400).json({ status: 'error', message: 'user id is required!' })

  if (
    !isBoolean(likes) &&
    !isBoolean(comments) &&
    !isBoolean(tags) &&
    !isBoolean(messages) &&
    !isBoolean(order_status) &&
    !isBoolean(community_alerts)
  ) {
    return res.status(400).json({ status: 'error', message: 'Nothing to update.' })
  }

  const _existing_user = await UsersService.getUserByID(userId)
  if (!_existing_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const updateData: any = {
    updated_by: requestorDocId || '',
    updated_from: source || '',
  }

  const newNotificationSettings = _existing_user.notification_settings || {}

  if (isBoolean(likes)) newNotificationSettings.likes = likes
  if (isBoolean(comments)) newNotificationSettings.comments = comments
  if (isBoolean(tags)) newNotificationSettings.tags = tags
  if (isBoolean(messages)) newNotificationSettings.messages = messages
  if (isBoolean(order_status)) newNotificationSettings.order_status = order_status
  if (isBoolean(community_alerts)) newNotificationSettings.community_alerts = community_alerts

  updateData.notification_settings = newNotificationSettings

  const _result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: _result })
}

export default updateUserNotificationSettings

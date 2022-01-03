import { Request, Response } from 'express'
import { UsersService } from '../../../service'
import { isBoolean } from 'lodash'
import { UserUpdateData } from '../../../models/User'

/**
 * @openapi
 * /v1/users/{userId}/toggleNotificationSetting:
 *   put:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ## Update the notification_settings field of the user document
 *       ### notification types are likes, comments, tags, messages, order_status, community_alerts, and subscriptions
 *       # Examples
 *       ## set likes, comments, community_alerts, and subscriptions to true
 *       ```
 *       {
 *         "likes": true,
 *         "comments": true,
 *         "community_alerts": true,
 *         "subscriptions": true
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
 *               subscriptions:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
const toggleNotificationSetting = async (req: Request, res: Response) => {
  const { userId } = req.params
  const data = req.body
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  if (!roles.editor && requestorDocId !== userId) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update another user',
    })
  }

  if (!userId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const { likes, comments, tags, messages, order_status, community_alerts, subscriptions } = data

  if (
    !isBoolean(likes) &&
    !isBoolean(comments) &&
    !isBoolean(tags) &&
    !isBoolean(messages) &&
    !isBoolean(order_status) &&
    !isBoolean(community_alerts) &&
    !isBoolean(subscriptions)
  ) {
    return res.status(400).json({
      status: 'error',
      message: 'Notification setting property must have a Boolean value.',
    })
  }

  const user = await UsersService.getUserByID(userId)
  if (!user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const updateData: UserUpdateData = {
    updated_by: requestorDocId || '',
    updated_from: data.source || '',
  }

  if (isBoolean(likes)) updateData['notification_settings.likes'] = likes
  if (isBoolean(comments)) updateData['notification_settings.comments'] = comments
  if (isBoolean(tags)) updateData['notification_settings.tags'] = tags
  if (isBoolean(messages)) updateData['notification_settings.messages'] = messages
  if (isBoolean(order_status)) updateData['notification_settings.order_status'] = order_status
  if (isBoolean(community_alerts))
    updateData['notification_settings.community_alerts'] = community_alerts
  if (isBoolean(subscriptions)) updateData['notification_settings.subscriptions'] = subscriptions

  const result = await UsersService.updateUser(userId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default toggleNotificationSetting

import { RequestHandler } from 'express'
import { ActivityUpdateData } from '../../../models/Activity'
import { ActivitiesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}:
 *   put:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a post
 *       # Examples
 *       ```
 *       {
 *         "message": "updated comment"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Updated activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateActivity: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const { user_id, message, source = '', status } = req.body
  const requestorDocId = res.locals.userDoc.id
  const requestorDoc = res.locals.userDoc

  const activity = await ActivitiesService.findById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.ActivityApiError, 'Acitivity', activityId)
  }
  if (activity.archived) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Activity with id ${activityId} is currently archived`,
    })
  }

  if (requestorDoc.archived) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `User with id ${user_id} is currently archived`,
    })
  }

  if (requestorDocId !== activity.user_id) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'User does not have a permission to update an activity of another user',
    })
  }

  const updateData: ActivityUpdateData = {
    message,
    updated_by: requestorDocId,
    updated_from: source || '',
  }

  if (status) updateData.status = status

  const result = await ActivitiesService.update(activityId, updateData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default updateActivity

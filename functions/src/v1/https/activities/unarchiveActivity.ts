import { RequestHandler } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/unarchive:
 *   put:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unarchived activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unarchiveActivity: RequestHandler = async (req, res) => {
  const data = req.body
  const { activityId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.ActivityApiError, 'Acitivity', activityId)
  }

  if (!roles.admin && requestorDocId !== activity.user_id) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'User does not have a permission to unarchive an activity of another user',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await ActivitiesService.unarchiveActivity(activityId, requestData)

  // unarchive the comments of the activity
  await CommentsService.unarchiveActivityComments(activityId)

  return res.json({ status: 'ok', data: result })
}

export default unarchiveActivity

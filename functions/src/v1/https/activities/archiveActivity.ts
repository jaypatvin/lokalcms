import { RequestHandler } from 'express'
import { ActivitiesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}:
 *   delete:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Archive the activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const archiveActivity: RequestHandler = async (req, res) => {
  const data = req.body
  const { activityId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.findById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.ActivityApiError, 'Acitivity', activityId)
  }

  if (!roles.admin && requestorDocId !== activity.user_id) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'User does not have a permission to delete an activity of another user',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await ActivitiesService.archive(activityId, requestData)

  return res.json({ status: 'ok', data: result })
}

export default archiveActivity

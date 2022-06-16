import { RequestHandler } from 'express'
import { ReportCreateData } from '../../../models/Report'
import { ActivitiesService, ReportsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/report:
 *   post:
 *     tags:
 *       - reports
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will report a post
 *       # Examples
 *       ```
 *       {
 *         "description": "this post has some offensive words and i am so offended!"
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
 *               description:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const reportActivity: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const { description } = req.body
  const requestor = res.locals.userDoc

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.ActivityApiError, 'Acitivity', activityId)
  }
  if (activity.archived) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Activity with id ${activityId} is currently archived`,
    })
  }

  if (requestor.id === activity.user_id) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'Cannot report own activity',
    })
  }

  const updateData: ReportCreateData = {
    description,
    user_id: requestor.id,
    reported_user_id: activity.user_id,
    activity_id: activityId,
    community_id: activity.community_id,
  }

  const result = await ReportsService.createActivityReport(activityId, updateData)

  return res.status(200).json({ status: 'ok', data: result })
}

export default reportActivity

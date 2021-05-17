import { Request, Response } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'

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
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 */
const unarchiveActivity = async (req: Request, res: Response) => {
  const data = req.body
  const { activityId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id
  const _activity = await ActivitiesService.getActivityById(activityId)

  if (!_activity)
    return res.status(403).json({ status: 'error', message: 'Activity does not exist!' })

  if (!roles.admin && requestorDocId !== _activity.user_id) {
    return res.status(403).json({
      status: 'error',
      message: "You do not have a permission unarchive another user's activity",
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

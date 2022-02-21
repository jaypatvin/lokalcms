import { Request, Response } from 'express'
import { ActivitiesService, LikesService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}/unlike:
 *   delete:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Unlike an activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unlike status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unlikeActivity = async (req: Request, res: Response) => {
  const { activityId } = req.params
  const requestorDocId = res.locals.userDoc.id

  if (!activityId)
    return res.status(400).json({ status: 'error', message: 'activity id is required!' })
  try {
    const _activity = await ActivitiesService.getActivityById(activityId)
    if (_activity.archived)
      return res.status(400).json({
        status: 'error',
        message: `Activity with id ${activityId} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })
  }

  const result = await LikesService.removeActivityLike(activityId, requestorDocId)
  return res.status(200).json({ status: 'ok', data: result })
}

export default unlikeActivity

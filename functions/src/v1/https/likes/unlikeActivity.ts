import { RequestHandler } from 'express'
import { ActivitiesService, LikesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

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
const unlikeActivity: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.findById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Activity', activityId)
  }
  if (activity.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Activity with id "${activityId}" is currently archived`,
    })
  }

  const exists = await LikesService.findActivityLike(activityId, requestorDocId)
  if (exists) {
    await LikesService.removeActivityLike(activityId, requestorDocId)
  }

  return res.status(200).json({ status: 'ok' })
}

export default unlikeActivity

import { RequestHandler } from 'express'
import { ActivitiesService, LikesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/like:
 *   post:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Like an activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The like
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const likeActivity: RequestHandler = async (req, res) => {
  const { activityId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Activity', activityId)
  }
  if (activity.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Activity with id "${activityId}" is currently archived`,
    })
  }

  const result = await LikesService.addActivityLike(activityId, requestorDocId)
  return res.status(200).json({ status: 'ok', data: result })
}

export default likeActivity

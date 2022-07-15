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
  if (!exists) {
    const likeData = {
      activity_id: activityId,
      user_id: requestorDocId,
      community_id: activity.community_id,
    }
    await LikesService.addActivityLike(activityId, requestorDocId, likeData)
  }

  return res.status(200).json({ status: 'ok' })
}

export default likeActivity

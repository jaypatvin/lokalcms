import { RequestHandler } from 'express'
import { ActivitiesService, LikesService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/comments/{commentId}/like:
 *   post:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: Like a comment
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: document id of the comment
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

// this has too many GET queries just for checking validity; maybe for refactoring
const likeComment: RequestHandler = async (req, res) => {
  const { activityId, commentId } = req.params
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

  const comment = await CommentsService.findActivityComment(activityId, commentId)
  if (!comment) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Activity', activityId)
  }
  if (comment.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Comment with id "${commentId}" on Activity with id "${activityId}" is currently archived`,
    })
  }

  const exists = await LikesService.findActivityCommentLike(activityId, commentId, requestorDocId)
  if (!exists) {
    const likeData = {
      activity_id: activityId,
      comment_id: commentId,
      user_id: requestorDocId,
      community_id: activity.community_id,
    }
    await LikesService.addCommentLike(activityId, commentId, requestorDocId, likeData)
  }

  return res.status(200).json({ status: 'ok' })
}

export default likeComment

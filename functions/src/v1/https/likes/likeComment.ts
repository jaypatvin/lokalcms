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

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Activity', activityId)
  }
  if (activity.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Activity with id "${activityId}" is currently archived`,
    })
  }

  const comment = await CommentsService.getCommentById(activityId, commentId)
  if (!comment) {
    throw generateNotFoundError(ErrorCode.LikeApiError, 'Activity', activityId)
  }
  if (comment.archived) {
    throw generateError(ErrorCode.LikeApiError, {
      message: `Comment with id "${commentId}" on Activity with id "${activityId}" is currently archived`,
    })
  }

  const result = await LikesService.addCommentLike(activityId, commentId, requestorDocId)
  return res.status(200).json({ status: 'ok', data: result })
}

export default likeComment

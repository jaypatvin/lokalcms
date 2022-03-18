import { RequestHandler } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/comments/{commentId}:
 *   get:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: Return the comment
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
 *         description: The comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Activities/Comments'
 */
const getComment: RequestHandler = async (req, res) => {
  const { activityId, commentId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Activity', activityId)
  }

  const comment = await CommentsService.getCommentById(activityId, commentId, requestorDocId)
  if (!comment) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Comment', commentId)
  }

  return res.status(200).json({ status: 'ok', data: comment })
}

export default getComment

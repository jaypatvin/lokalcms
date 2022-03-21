import { RequestHandler } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/comments/{commentId}/unarchive:
 *   put:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the comment
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
 *         description: Unarchived activity
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unarchiveComment: RequestHandler = async (req, res) => {
  const { activityId, commentId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Activity', activityId)
  }

  const comment = await CommentsService.getCommentById(activityId, commentId)
  if (!comment) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Comment', commentId)
  }

  if (!roles.admin && requestorDocId !== comment.user_id) {
    throw generateError(ErrorCode.CommentApiError, {
      message: 'User does not have a permission to unarchive a comment of another user',
    })
  }

  const result = await CommentsService.unarchiveComment(activityId, commentId)
  await ActivitiesService.incrementActivityCommentCount(activityId)
  return res.json({ status: 'ok', data: result })
}

export default unarchiveComment

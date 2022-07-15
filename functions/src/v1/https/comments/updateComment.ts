import { RequestHandler } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/activities/{activityId}/comments/{commentId}:
 *   put:
 *     tags:
 *       - activity comments
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update a comment
 *       # Examples
 *       ```
 *       {
 *         "message": "updated comment"
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
 *       - in: path
 *         name: commentId
 *         required: true
 *         description: document id of the comment
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Activity/Comment'
 */
const updateComment: RequestHandler = async (req, res) => {
  const { activityId, commentId } = req.params
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const requestorDoc = res.locals.userDoc

  const activity = await ActivitiesService.findById(activityId)
  if (!activity) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Activity', activityId)
  }

  if (activity.archived) {
    throw generateError(ErrorCode.CommentApiError, {
      message: `Activity with id ${activityId} is currently archived`,
    })
  }

  const comment = await CommentsService.findActivityComment(activityId, commentId)
  if (!comment) {
    throw generateNotFoundError(ErrorCode.CommentApiError, 'Comment', commentId)
  }

  if (requestorDoc.archived) {
    throw generateError(ErrorCode.CommentApiError, {
      message: `User with id ${requestorDocId} is currently archived`,
    })
  }

  if (requestorDocId !== comment.user_id) {
    throw generateError(ErrorCode.CommentApiError, {
      message: 'User does not have a permission to edit a comment of another user',
    })
  }

  const result = await CommentsService.update(activityId, commentId, {
    message: data.message,
  })

  return res.status(200).json({ status: 'ok', data: result })
}

export default updateComment

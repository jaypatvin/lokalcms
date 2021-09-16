import { Request, Response } from 'express'
import { UsersService, ActivitiesService, CommentsService } from '../../../service'

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
const updateComment = async (req: Request, res: Response) => {
  const { activityId, commentId } = req.params
  const data = req.body
  const requestorDocId = res.locals.userDoc.id

  const _activity = await ActivitiesService.getActivityById(activityId)

  if (!_activity) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  if (_activity.archived)
    return res.status(400).json({
      status: 'error',
      message: `Activity with id ${activityId} is currently archived!`,
    })

  const _comment = await CommentsService.getCommentById(activityId, commentId)

  if (!_comment) return res.status(400).json({ status: 'error', message: 'Invalid Comment ID!' })

  if (!data.message)
    return res.status(400).json({ status: 'error', message: 'Missing field: message' })

  // get user and validate
  const _user = await UsersService.getUserByID(requestorDocId)
  if (!_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  // this should not happen, comment should also be archived
  if (_user.status === 'archived')
    return res.status(406).json({
      status: 'error',
      message: `User with id ${_user.id} is currently archived!`,
    })

  if (requestorDocId !== _comment.user_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to edit the comment.',
    })
  }

  const _result = await CommentsService.updateActivityComment(activityId, commentId, {
    message: data.message,
  })

  return res.status(200).json({ status: 'ok', data: _result })
}

export default updateComment

import { Request, Response } from 'express'
import { UsersService, ActivitiesService, LikesService, CommentsService } from '../../../service'
import { validateFields } from '../../../utils/validations'

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string

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
const likeComment = async (req: Request, res: Response) => {
  const { activityId, commentId } = req.params
  const data = req.body

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

  if (!commentId)
    return res.status(400).json({ status: 'error', message: 'comment id is required!' })

  try {
    const _comment = await CommentsService.getCommentById(activityId, commentId)
    if (_comment.archived)
      return res.status(400).json({
        status: 'error',
        message: `Comment with id ${commentId} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid comment ID!' })
  }

  const error_fields = validateFields(data, ['user_id'])
  if (error_fields.length) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Required fields missing', error_fields })
  }

  // get user and validate
  try {
    const _user = await UsersService.getUserByID(data.user_id)
    if (_user.status === 'archived')
      return res.status(400).json({
        status: 'error',
        message: `User with id ${data.user_id} is currently archived!`,
      })
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }

  const result = await LikesService.addCommentLike(activityId, commentId, data.user_id)
  return res.status(200).json({ status: 'ok', data: result })
}

export default likeComment

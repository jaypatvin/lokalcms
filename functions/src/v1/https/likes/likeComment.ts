import { Request, Response } from 'express'
import { ActivitiesService, LikesService, CommentsService } from '../../../service'

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
const likeComment = async (req: Request, res: Response) => {
  const { activityId, commentId } = req.params
  const requestorDocId = res.locals.userDoc.id

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

  const result = await LikesService.addCommentLike(activityId, commentId, requestorDocId)
  return res.status(200).json({ status: 'ok', data: result })
}

export default likeComment

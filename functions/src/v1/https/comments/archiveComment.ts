import { Request, Response } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}/comment/{commentId}:
 *   delete:
 *     tags:
 *       - activities, comments
 *     security:
 *       - bearerAuth: []
 *     description: Archive the comment
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
 *         description: Archived activity
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
const archiveComment = async (req: Request, res: Response) => {
  const { activityId, commentId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDocId

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  const comment = await CommentsService.getCommentById(activityId, commentId)
  if(!comment) return res.status(400).json({ status: 'error', message: 'Invalid Comment ID!' })

  if (!roles.admin && requestorDocId !== comment.user_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }

  const result = await CommentsService.archiveComment(activityId, commentId)

  return res.json({ status: 'ok', data: result })
}

export default archiveComment

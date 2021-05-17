import { Request, Response } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}/comments/{commentId}/unarchive:
 *   put:
 *     tags:
 *       - comments
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
 *                 data:
 *                   $ref: '#/components/schemas/Activity'
 */
const unarchiveComment = async (req: Request, res: Response) => {
  const { activityId, commentId } = req.params
  const roles = res.locals.userRoles
  const requestorDocId = res.locals.userDoc.id

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  const comment = await CommentsService.getCommentById(activityId, commentId)
  if (!comment) return res.status(400).json({ status: 'error', message: 'Invalid Comment ID!' })

  if (!roles.admin && requestorDocId !== comment.user_id) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to unarchive.',
    })
  }

  const result = await CommentsService.unarchiveComment(activityId, commentId)
  await ActivitiesService.incrementActivityCommentCount(activityId)
  return res.json({ status: 'ok', data: result })
}

export default unarchiveComment

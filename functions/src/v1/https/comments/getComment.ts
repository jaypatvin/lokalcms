import { Request, Response } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}/comments/{commentId}:
 *   get:
 *     tags:
 *       - comments
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
const getComment = async (req: Request, res: Response) => {
  const { activityId, commentId } = req.params

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  const comment = await CommentsService.getCommentById(activityId, commentId)
  if(!comment) return res.status(400).json({ status: 'error', message: 'Invalid Comment ID!' })

  return res.status(200).json({ status: 'ok', data: comment })
}

export default getComment

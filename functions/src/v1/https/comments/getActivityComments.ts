import { Request, Response } from 'express'
import { ActivitiesService, CommentsService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}/comments:
 *   get:
 *     tags:
 *       - comments
 *     security:
 *       - bearerAuth: []
 *     description: Returns activity comments
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The comments of the activity
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
const getActivityComments = async (req: Request, res: Response) => {
  const { activityId } = req.params

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) return res.status(400).json({ status: 'error', message: 'Invalid Activity ID!' })

  const comments = await CommentsService.getActivityComments(activityId)

  return res.status(200).json({ status: 'ok', data: comments })
}

export default getActivityComments

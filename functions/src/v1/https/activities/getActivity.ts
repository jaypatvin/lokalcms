import { Request, Response } from 'express'
import { ActivitiesService } from '../../../service'

/**
 * @openapi
 * /v1/activities/{activityId}:
 *   get:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Return the activity
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         description: document id of the activity
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single activity
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
const getActivity = async (req: Request, res: Response) => {
  const { activityId } = req.params

  const activity = await ActivitiesService.getActivityById(activityId)
  if (!activity) return res.status(404).json({ status: 'error', message: 'Post does not exist!' })

  return res.status(200).json({ status: 'ok', data: activity })
}

export default getActivity

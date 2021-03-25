import { Request, Response } from 'express'
import { ActivitiesService, UsersService } from '../../../service'

/**
 * @openapi
 * /v1/users/{userId}/activities:
 *   get:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Returns user activities
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 */
const getUserActivities = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId) return res.status(400).json({ status: 'error', message: 'userId is required!' })

  const activities = await ActivitiesService.getActivitiesByUserID(userId)
  return res.status(200).json({ status: 'ok', data: activities })
}

export default getUserActivities

import { RequestHandler } from 'express'
import { ActivitiesService } from '../../../service'

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
const getUserActivities: RequestHandler = async (req, res) => {
  const { userId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activities = await ActivitiesService.getActivitiesByUserID(userId, requestorDocId)

  return res.status(200).json({ status: 'ok', data: activities })
}

export default getUserActivities

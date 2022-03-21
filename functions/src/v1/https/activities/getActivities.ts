import { RequestHandler } from 'express'
import { ActivitiesService } from '../../../service'

/**
 * @openapi
 * /v1/activities:
 *   get:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Returns all activities
 *     responses:
 *       200:
 *         description: All activities
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
const getActivities: RequestHandler = async (req, res) => {
  const requestorDocId = res.locals.userDoc.id
  const activities = await ActivitiesService.getAllActivities(requestorDocId)

  return res.status(200).json({ status: 'ok', data: activities })
}

export default getActivities

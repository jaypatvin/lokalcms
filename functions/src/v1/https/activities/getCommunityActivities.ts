import { RequestHandler } from 'express'
import { ActivitiesService } from '../../../service'

/**
 * @openapi
 * /v1/community/{communityId}/activities:
 *   get:
 *     tags:
 *       - activities
 *     security:
 *       - bearerAuth: []
 *     description: Returns commmunity activities
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of community activities
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
const getCommunityActivities: RequestHandler = async (req, res) => {
  const { communityId } = req.params
  const requestorDocId = res.locals.userDoc.id

  const activities = await ActivitiesService.getActivitiesByCommunityID(communityId, requestorDocId)

  return res.status(200).json({ status: 'ok', data: activities })
}

export default getCommunityActivities

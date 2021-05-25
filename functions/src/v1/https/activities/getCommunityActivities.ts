import { Request, Response } from 'express'
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
const getCommunityActivities = async (req: Request, res: Response) => {
  const { communityId } = req.params

  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'communityId is required!' })
  const activities = await ActivitiesService.getActivitiesByCommunityID(communityId)

  return res.status(200).json({ status: 'ok', data: activities })
}

export default getCommunityActivities

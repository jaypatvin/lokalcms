import { RequestHandler } from 'express'
import { CommunityService } from '../../../service'

/**
 * @openapi
 * /v1/community:
 *   get:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Returns all communities
 *     responses:
 *       200:
 *         description: List of communities
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
 *                     $ref: '#/components/schemas/Community'
 */
const getCommunities: RequestHandler = async (req, res) => {
  const result = await CommunityService.getCommunities()

  result.forEach((community) => {
    delete community.keywords
  })

  return res.json({ status: 'ok', data: result })
}

export default getCommunities

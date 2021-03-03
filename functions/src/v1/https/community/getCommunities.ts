import { Request, Response } from 'express'
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
const getCommunities = async (req: Request, res: Response) => {
  const result = await CommunityService.getCommunities()

  if (!result.length) return res.status(204).json({ status: 'ok', data: result, message: 'No communities' })

  result.forEach(user => {
    delete user.keywords
  })

  return res.json({ status: 'ok', data: result })
}

export default getCommunities

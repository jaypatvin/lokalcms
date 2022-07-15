import { RequestHandler } from 'express'
import { omit } from 'lodash'
import { UsersService } from '../../../service'

/**
 * @openapi
 * /v1/community/{communityId}/users:
 *   get:
 *     tags:
 *       - users
 *     security:
 *       - bearerAuth: []
 *     description: Return the users in the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users in the community
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
 *                     $ref: '#/components/schemas/User'
 */
const getUsersByCommunityId: RequestHandler = async (req, res) => {
  const { communityId } = req.params

  const users = await UsersService.findByCommunityId(communityId)

  const result = users.map((user) => omit(result, ['keywords', 'community']))

  return res.json({ status: 'ok', data: result })
}

export default getUsersByCommunityId

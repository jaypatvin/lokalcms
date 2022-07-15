import { RequestHandler } from 'express'
import { omit } from 'lodash'
import { CommunityService } from '../../../service'
import { generateNotFoundError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/community/{communityId}:
 *   get:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Return the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single community
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Community'
 */
const getCommunity: RequestHandler = async (req, res) => {
  const { communityId } = req.params

  const result = await CommunityService.findById(communityId)
  if (!result) {
    throw generateNotFoundError(ErrorCode.CommunityApiError, 'Community', communityId)
  }

  return res.json({ status: 'ok', data: omit(result, ['keywords']) })
}

export default getCommunity

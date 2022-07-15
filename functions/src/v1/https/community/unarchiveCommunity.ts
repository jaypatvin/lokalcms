import { RequestHandler } from 'express'
import { CommunityService } from '../../../service'
import { generateError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/community/{communityId}/unarchive:
 *   put:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unarchived community
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const unarchiveCommunity: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const roles = res.locals.userRoles
  if (!roles.admin) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: 'User does not have a permission to unarchive a community',
    })
  }
  const { communityId } = req.params

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await CommunityService.unarchive(communityId, requestData)

  return res.json({
    status: 'ok',
    data: result,
  })
}

export default unarchiveCommunity

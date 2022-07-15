import { RequestHandler } from 'express'
import { CommunityService } from '../../../service'
import { generateError, ErrorCode } from '../../../utils/generators'

/**
 * @openapi
 * /v1/community/{communityId}:
 *   delete:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: Archive the community
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived community
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const deleteCommunity: RequestHandler = async (req, res) => {
  const roles = res.locals.userRoles
  if (!roles.admin) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: 'User does not have a permission to delete a community',
    })
  }
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const { communityId } = req.params

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await CommunityService.archive(communityId, requestData)

  return res.json({
    status: 'ok',
    data: result,
  })
}

export default deleteCommunity

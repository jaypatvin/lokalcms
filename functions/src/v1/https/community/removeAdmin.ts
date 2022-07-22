import { RequestHandler } from 'express'
import { CommunityService, UsersService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/community/{communityId}/admins/{userId}:
 *   delete:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will remove the user as admin in a community
 *
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         description: document id of the user to be removed as admin
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const removeAdmin: RequestHandler = async (req, res) => {
  const { communityId, userId } = req.params
  const requestor = res.locals.userDoc

  if (requestor.community_id !== communityId) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: 'Cannot add admin to another community',
    })
  }

  const community = await CommunityService.findById(communityId)
  if (!community) {
    throw generateNotFoundError(ErrorCode.CommunityApiError, 'Community', communityId)
  }

  const user = await UsersService.findById(userId)
  if (!user) {
    throw generateNotFoundError(ErrorCode.CommunityApiError, 'User', userId)
  }

  if (community.archived) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: `Community with id ${communityId} is currently archived`,
    })
  }

  if (!community.admins.includes(requestor.id)) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: 'Only a community admin can remove another admin',
    })
  }

  if (!community.admins.includes(userId)) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: `User with id ${userId} is already not an admin`,
    })
  }

  const newAdmins = community.admins.filter((admin) => admin !== userId)

  const result = await CommunityService.update(communityId, {
    admins: newAdmins,
  })

  return res.status(200).json({ status: 'ok', data: result })
}

export default removeAdmin

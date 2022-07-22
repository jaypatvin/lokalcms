import { RequestHandler } from 'express'
import { CommunityService, UsersService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/community/{communityId}/admins:
 *   post:
 *     tags:
 *       - community
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will add a new admin in a community
 *
 *     parameters:
 *       - in: path
 *         name: communityId
 *         required: true
 *         description: document id of the community
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 required: true
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
const addAdmin: RequestHandler = async (req, res) => {
  const { communityId } = req.params
  const { user_id } = req.body
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

  const user = await UsersService.findById(user_id)
  if (!user) {
    throw generateNotFoundError(ErrorCode.CommunityApiError, 'User', user_id)
  }

  if (community.archived) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: `Community with id ${communityId} is currently archived`,
    })
  }

  if (!community.admins.includes(requestor.id)) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: 'Only a community admin can add a new admin',
    })
  }

  if (community.admins.includes(user_id)) {
    throw generateError(ErrorCode.CommunityApiError, {
      message: `User with id ${user_id} is already an admin`,
    })
  }

  const newAdmins = [...community.admins, user_id]

  const result = await CommunityService.update(communityId, {
    admins: newAdmins,
  })

  return res.status(200).json({ status: 'ok', data: result })
}

export default addAdmin

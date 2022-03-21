import { RequestHandler } from 'express'
import { InvitesService } from '../../../service'
import { ErrorCode, generateError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/invite/check/{inviteCode}:
 *   get:
 *     tags:
 *       - invite
 *     description: Return the invite if the code matches and is valid
 *     parameters:
 *       - in: path
 *         name: inviteCode
 *         required: true
 *         description: invite code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Single invite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   $ref: '#/components/schemas/Invite'
 */
const checkInvite: RequestHandler = async (req, res) => {
  const { inviteCode } = req.params

  const invite = await InvitesService.getInviteByCode(inviteCode)
  if (!invite) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Invite with code "${inviteCode} was not found"`,
    })
  }

  if (invite.claimed) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Invite with code "${inviteCode} was already claimed"`,
    })
  }

  if (invite.status !== 'enabled') {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Invite with code "${inviteCode} is disabled"`,
    })
  }

  const data = {
    id: invite.id,
    community_id: invite.community_id,
  }

  return res.json({ status: 'ok', data })
}

export default checkInvite

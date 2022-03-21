import { RequestHandler } from 'express'
import { InvitesService, UsersService } from '../../../service'
import { generateError, ErrorCode, generateNotFoundError } from '../../../utils/generators'

/**
 * @openapi
 * /v1/invite/claim:
 *   post:
 *     tags:
 *       - invite
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will claim the invite
 *       # Examples
 *       ```
 *       {
 *         "user_id": "user_id_of_the_invitee",
 *         "code": "A1B2C3"
 *       }
 *       ```
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: The new invite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Invite code is now claimed by User!
 */
const claimInvite: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id

  const invite = await InvitesService.getInviteByCode(data.code)
  if (!invite) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Invite with code "${data.code} was not found"`,
    })
  }

  if (invite.expire_by && Date.now() > invite.expire_by) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: `Invite for "${invite.invitee_email}" has expired`,
    })
  }

  const user = await UsersService.getUserByID(data.user_id)
  if (!user) {
    throw generateNotFoundError(ErrorCode.InviteApiError, 'User', data.user_id)
  }

  if (user.email !== invite.invitee_email) {
    throw generateError(ErrorCode.ActivityApiError, {
      message: 'Invitee email does not match with the requestor',
    })
  }

  // update and claim the invite to the user
  InvitesService.updateInvite(invite.id, {
    claimed: true,
    invitee: data.user_id,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  })

  return res.json({ status: 'ok' })
}

export default claimInvite

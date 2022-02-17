import { InvitesService, UsersService } from '../../../service'
import { Request, Response } from 'express'

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
const claimInvite = async (req: Request, res: Response) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const invite = await InvitesService.getInviteByCode(data.code)

  if (!invite) {
    return res.status(400).json({ status: 'error', message: 'Invalid Invite Code!' })
  }

  if (invite.expire_by && Date.now() > invite.expire_by) {
    return res.status(400).json({ status: 'error', message: 'The invite has expired.' })
  }

  const user = await UsersService.getUserByID(data.user_id)

  if (!user) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }

  if (user.email !== invite.invitee_email) {
    return res.status(400).json({ status: 'error', message: 'Invitee email is different.' })
  }

  // update and claim the invite to the user
  InvitesService.updateInvite(invite.id, {
    claimed: true,
    invitee: data.user_id,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  })

  return res.json({
    status: 'ok',
    message: 'Invite code is now claimed by ' + user.email + '!',
  })
}

export default claimInvite

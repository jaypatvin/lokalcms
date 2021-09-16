import { Request, Response } from 'express'
import { InvitesService } from '../../../service'
import { generateInviteKeywords } from '../../../utils/generateKeywords'

/**
 * @openapi
 * /v1/invite/{inviteId}:
 *   put:
 *     tags:
 *       - invite
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will update an invite
 *       # Examples
 *       ```
 *       {
 *         "status": "disabled"
 *       }
 *       ```
 *
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         description: document id of the invite
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               claimed:
 *                 type: boolean
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated invite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const updateInvite = async (req: Request, res: Response) => {
  const { inviteId } = req.params
  const data = req.body
  const requestorDocId = res.locals.userDoc.id

  if (!inviteId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const invite = await InvitesService.getInviteByID(inviteId)
  if (!invite) return res.status(400).json({ status: 'error', message: 'Invalid Invite Id!' })

  const roles = res.locals.userRoles
  if (!roles.editor)
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to update an invite',
    })

  const updateData: any = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (data.email && data.email !== invite.invitee_email) {
    const keywords = generateInviteKeywords({
      invitee_email: data.email,
      code: invite.code,
    })
    updateData.keywords = keywords
  }

  if (data.email && data.email !== invite.invitee_email) updateData.invitee_email = data.email
  if (data.status && data.status !== invite.status) updateData.status = data.status
  if (data.hasOwnProperty('claimed') && data.claimed !== invite.claimed)
    updateData.claimed = data.claimed

  if (!Object.keys(updateData).length)
    return res.status(400).json({ status: 'error', message: 'no changes' })

  const result = await InvitesService.updateInvite(inviteId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateInvite

import { RequestHandler } from 'express'
import { InviteUpdateData } from '../../../models/Invite'
import { InvitesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

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
const updateInvite: RequestHandler = async (req, res) => {
  const { inviteId } = req.params
  const data = req.body
  const requestorDocId = res.locals.userDoc.id

  const invite = await InvitesService.getInviteByID(inviteId)
  if (!invite) {
    throw generateNotFoundError(ErrorCode.InviteApiError, 'Invite', inviteId)
  }

  const roles = res.locals.userRoles
  if (!roles.editor) {
    throw generateError(ErrorCode.InviteApiError, {
      message: 'User does not have a permission to update an invite',
    })
  }

  const updateData: InviteUpdateData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  if (data.status && data.status !== invite.status) updateData.status = data.status
  if (data.hasOwnProperty('claimed') && data.claimed !== invite.claimed) {
    updateData.claimed = data.claimed
  }

  const result = await InvitesService.updateInvite(inviteId, updateData)

  return res.json({ status: 'ok', data: result })
}

export default updateInvite

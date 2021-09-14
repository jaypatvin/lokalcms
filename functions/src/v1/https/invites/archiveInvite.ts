import { Request, Response } from 'express'
import { InvitesService } from '../../../service'

/**
 * @openapi
 * /v1/invite/{inviteId}:
 *   delete:
 *     tags:
 *       - invite
 *     security:
 *       - bearerAuth: []
 *     description: Archive the invite
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         description: document id of the invite
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Archived invite
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
const archiveInvite = async (req: Request, res: Response) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const { inviteId } = req.params
  const roles = res.locals.userRoles
  const _invite = await InvitesService.getInviteByID(inviteId)

  if (!_invite) return res.status(403).json({ status: 'error', message: 'Invite does not exist!' })

  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to delete.',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await InvitesService.archiveInvite(inviteId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveInvite

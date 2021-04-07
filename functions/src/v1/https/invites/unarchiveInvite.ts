import { Request, Response } from 'express'
import { InvitesService } from '../../../service'

/**
 * @openapi
 * /v1/invite/{inviteId}/unarchive:
 *   put:
 *     tags:
 *       - invite
 *     security:
 *       - bearerAuth: []
 *     description: Unarchive the invite
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         description: document id of the invite
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unarchived invite
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
const unarchiveProduct = async (req: Request, res: Response) => {
  const data = req.body
  const requestorDocId = res.locals.userDocId
  const { inviteId } = req.params
  const roles = res.locals.userRoles
  const _invite = await InvitesService.getInviteByID(inviteId)

  if (!_invite) return res.status(403).json({ status: 'error', message: 'Invite does not exist!' })

  if (!roles.admin) {
    return res.status(403).json({
      status: 'error',
      message: 'You do not have a permission to unarchive an invite',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await InvitesService.unarchiveInvite(inviteId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default unarchiveProduct

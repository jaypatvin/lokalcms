import { RequestHandler } from 'express'
import { InvitesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

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
const archiveInvite: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const { inviteId } = req.params
  const roles = res.locals.userRoles

  const invite = await InvitesService.findById(inviteId)
  if (!invite) {
    throw generateNotFoundError(ErrorCode.InviteApiError, 'Invite', inviteId)
  }

  if (!roles.admin) {
    throw generateError(ErrorCode.InviteApiError, {
      message: 'User does not have a permission to delete an invite',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await InvitesService.archive(inviteId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default archiveInvite

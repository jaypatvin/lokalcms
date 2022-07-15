import { RequestHandler } from 'express'
import { InvitesService } from '../../../service'
import { generateNotFoundError, ErrorCode, generateError } from '../../../utils/generators'

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
 */
const unarchiveProduct: RequestHandler = async (req, res) => {
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
      message: 'User does not have a permission to unarchive an invite',
    })
  }

  const requestData = {
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await InvitesService.unarchive(inviteId, requestData)
  return res.json({ status: 'ok', data: result })
}

export default unarchiveProduct

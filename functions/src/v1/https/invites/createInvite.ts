import { RequestHandler } from 'express'
import * as functions from 'firebase-functions'
import humanPassword from 'human-password'
import sgMail from '@sendgrid/mail'
import { InvitesService } from '../../../service'
import { generateInviteKeywords } from '../../../utils/generators'
import { disableInvitesByEmail } from '../../../service/invites'
import { InviteCreateData } from '../../../models/Invite'

sgMail.setApiKey(functions.config().mail_service.key)

/**
 * @openapi
 * /v1/invite:
 *   post:
 *     tags:
 *       - invite
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       ### This will create a new invite
 *       # Examples
 *       ```
 *       {
 *         "email": "neighbortoinvite@gmail.com"
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
 *               email:
 *                 type: string
 *                 required: true
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
 *                 data:
 *                   $ref: '#/components/schemas/Invite'
 */

const createInvite: RequestHandler = async (req, res) => {
  const data = req.body
  const requestorDocId = res.locals.userDoc.id
  const requestorCommunityId = res.locals.userDoc.community_id

  const { email, code: invite_code } = data

  const dupInvites = await disableInvitesByEmail(email)
  if (dupInvites) console.log(`Disabled ${dupInvites} invites to the same email: ${email}`)

  const code = humanPassword({ couples: 3, digits: 3 })

  const keywords = generateInviteKeywords({
    code: invite_code || code,
    invitee_email: email,
  })

  const expire_by = Date.now() + 3600000 * 24 // in 24 hours

  const new_invite = {
    claimed: false,
    code: invite_code || code,
    community_id: requestorCommunityId,
    expire_by,
    invitee_email: email,
    inviter: requestorDocId,
    status: 'enabled' as InviteCreateData['status'],
    keywords,
    archived: false,
    updated_by: requestorDocId,
    updated_from: data.source || '',
  }

  const result = await InvitesService.createInvite(new_invite)

  console.log(`sending invite to ${email}`)
  const msg = {
    to: email,
    from: functions.config().invite_mail_config.from,
    'reply-to': functions.config().invite_mail_config.reply_to,
    subject: functions.config().invite_mail_config.subject,
    html: `<strong>Please use invite code ${invite_code || code}</strong>`,
  }

  await sgMail.send(msg)
  return res.json({ status: 'ok', data: result })
}

export default createInvite

import { Request, Response } from 'express'
import * as functions from 'firebase-functions'
import humanPassword from 'human-password'
import sgMail from '@sendgrid/mail'
import { UsersService, InvitesService } from '../../../service'
import { generateInviteKeywords } from '../../../utils/generateKeywords'

sgMail.setApiKey(functions.config().mail_service.key)

const createInvite = async (req: Request, res: Response) => {
  const { user_id, email } = req.body
  let _user: FirebaseFirestore.DocumentData
  if (!user_id || !email) {
    return res.status(400).json({ status: 'error', message: 'user_id or email is missing' })
  }

  // check if user id is valid
  try {
    _user = await UsersService.getUserByID(user_id)
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid user_id!' })
  }

  if (!_user) return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })

  const code = humanPassword({ couples: 3, digits: 3 })

  const keywords = generateInviteKeywords({
    code,
    invitee_email: email,
  })

  const new_invite = {
    claimed: false,
    code,
    community_id: _user.community_id,
    expire_by: Date.now() + 3600000,
    invitee_email: email,
    inviter: _user.id,
    status: 'enabled',
    keywords,
  }

  const result = await InvitesService.createInvite(new_invite)

  console.log(`sending invite to ${email}`)
  const msg = {
    to: email,
    from: functions.config().invite_mail_config.from,
    'reply-to': functions.config().invite_mail_config.reply_to,
    subject: functions.config().invite_mail_config.subject,
    html: `<strong>Please use invite code ${code}</strong>`,
  }

  await sgMail.send(msg)
  return res.json({ status: 'ok', data: result })
}

export default createInvite

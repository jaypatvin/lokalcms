import { Request, Response } from 'express'
import humanPassword from 'human-password'
import { UsersService, InvitesService } from '../../../service'

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

  const new_invite = {
    claimed: false,
    code,
    community_id: _user.community_id,
    expire_by: Date.now() + 3600000,
    invitee_email: email,
    inviter: _user.id,
    status: "enabled"
  }

  const result = await InvitesService.createInvite(new_invite)

  // TODO: send invite mail
  console.log(`sending invite to ${email}`)
  return res.json({ status: 'ok', data: result })
}

export default createInvite

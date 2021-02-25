import { InvitesService, UsersService } from '../../../service'
import { Request, Response } from 'express'

const claimInvite = async (req: Request, res: Response) => {
  const data = req.body
  let _invite
  let _user
  try {
    _invite = await InvitesService.getInviteByCode(data.code)
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid Invite Code!' })
  }

  if (!_invite) {
    return res.status(400).json({ status: 'error', message: 'Invalid Invite Code!' })
  }

  if (_invite.expire_by && Date.now() > _invite.expire_by) {
    return res.status(400).json({ status: 'error', message: 'The invite has expired.' })
  }

  // check if user id is valid
  try {
    _user = await UsersService.getUserByID(data.user_id)
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  }

  if (!_user) {
    return res.status(400).json({ status: 'error', message: 'Invalid User ID!' })
  } else if (_user.email !== _invite.invitee_email) {
    return res
      .status(400)
      .json({
        status: 'error',
        message: 'The invitee email does not match the email of user claiming the invite!',
      })
  }

  console.log(_user)

  // update and claim the invite to the user
  InvitesService.updateInvite(_invite.id, {
    claimed: true,
    invitee: data.user_id,
  })

  return res.json({
    status: 'ok',
    message: 'Invite code is now claimed by ' + _user.display_name + '!',
  })
}

export default claimInvite

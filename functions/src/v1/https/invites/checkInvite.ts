import { InvitesService } from '../../../service'
import { Request, Response } from 'express'

const checkInvite = async (req: Request, res: Response) => {
  const params = req.params
  let _invite
  try {
    _invite = await InvitesService.getInviteByCode(params.inviteCode)
  } catch (e) {
    return res.status(400).json({ status: 'error', message: 'Invalid Invite Code!' })
  }

  // check if invite is enabled
  if (_invite.status !== 'enabled') {
    return res.status(400).json({ status: 'error', message: 'Invalid Invite Code!' })
  }

  if (_invite.claimed) {
    return res.status(400).json({ status: 'error', message: 'Invite code is already claimed!' })
  }

  const _data = {
    id: _invite.id,
    community_id: _invite.community_id,
  }

  return res.json({ status: 'ok', message: 'Invite code is valid!', data: _data })
}

export default checkInvite

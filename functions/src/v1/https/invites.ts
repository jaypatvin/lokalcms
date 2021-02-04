import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { getInviteByCode, updateInvite } from '../../service/invites'
import { getUserByID } from '../../service/users'
import { user } from 'firebase-functions/lib/providers/auth'


//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getInvites = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const checkInvite = async (req, res) => {

  const params = req.params
  let _invite 
  try {
    _invite = await getInviteByCode(params.inviteCode)
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid Invite Code!'})
  }

  // check if invite is enabled
  if (_invite.status !== 'enabled') {
    return res.json({status: 'error', message: 'Invalid Invite Code!'})
  }

  if (_invite.claimed) {
    return res.json({status: 'error', message: 'Invite code is already claimed!'})
  }

  const _data = {
    id: _invite.id,
    community_id: _invite.community_id
  }


  res.json({status: 'ok', message: 'Invite code is valid!', data: _data})
}


export const claimInvite = async (req, res) => {

  const data = req.body
  let _invite 
  let _user
  try {
    _invite = await getInviteByCode(data.code)
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid Invite Code!'})
  }

  // check if user id is valid
  try {
    _user = await getUserByID(data.user_id)
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid User ID!'})
  }

  console.log(_user)

  // update and claim the invite to the user
  // updateInvite(_invite.id, {
  //   claimed: true,
  //   invitee: data.user_id
  // })


  res.json({status: 'ok', message: 'Invite code is now claimed by ' + _user.display_name + '!'})
}

export const createInvite = async (req, res) => {

  res.json({status: 'ok'})
}


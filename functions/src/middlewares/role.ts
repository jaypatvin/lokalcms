/*
# from https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
*/

import { NextFunction, Request, Response } from 'express'
import { UsersService } from '../service'

type RolesType = {
  admin?: boolean
  editor?: boolean
  member?: boolean
}

const roles = [
  'admin',
  'editor',
  'member'
]

const role = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = req.user
  let userRoles: RolesType = {}
  if (authUser && authUser.uid) {
    const userDocs = await UsersService.getUserByUID(authUser.uid)
    if (userDocs.length) {
      const user = userDocs[0]
      res.locals.userDocId = user.id
      res.locals.userCommunityId = user.community_id
      userRoles = user.roles
      if (userRoles && userRoles.admin) {
        // if admin, all roles should be true
        roles.forEach(role => userRoles[role] = true)
      }
    }
  }
  res.locals.userRoles = userRoles

  next()
  return
}

export default role

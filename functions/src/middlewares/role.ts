import { RequestHandler } from 'express'
import { UsersService } from '../service'

type RolesType = {
  admin?: boolean
  editor?: boolean
  member?: boolean
}

const roles = ['admin', 'editor', 'member']

const role: RequestHandler = async (req, res, next) => {
  // @ts-ignore
  const authUser = req.user
  let userRoles: RolesType = {}
  res.locals.userDoc = {}
  if (authUser && authUser.uid) {
    const userDoc = await UsersService.findUserByUid(authUser.uid)
    if (userDoc) {
      res.locals.userDoc = userDoc
      userRoles = userDoc.roles
      if (userRoles && userRoles.admin) {
        // if admin, all roles should be true
        roles.forEach((role) => (userRoles[role] = true))
      }
    }
  }
  res.locals.userRoles = userRoles

  next()
  return
}

export default role

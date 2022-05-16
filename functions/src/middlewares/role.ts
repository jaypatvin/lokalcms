import { RequestHandler } from 'express'
import { UsersService } from '../service'

type RolesType = {
  admin?: boolean
  editor?: boolean
  member?: boolean
}

const roles = ['admin', 'editor', 'member']

const role: RequestHandler = async (req, res, next) => {
  const authUser = req.user
  let userRoles: RolesType = {}
  res.locals.userDoc = {}
  if (authUser && authUser.uid) {
    const userDocs = await UsersService.getUserByUID(authUser.uid)
    if (userDocs.length) {
      const user = userDocs[0]
      res.locals.userDoc = user
      userRoles = user.roles
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

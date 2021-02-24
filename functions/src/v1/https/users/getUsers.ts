import { Request, Response } from 'express'
import { UsersService } from '../../../service'

const getUsers = async (req: Request, res: Response) => {
  const result = await UsersService.getUsers()

  if (!result.length) return res.status(204).json({ status: 'ok', data: result, message: 'No users' })

  result.forEach(user => {
    delete user.keywords
    delete user.community
  })

  return res.json({ status: 'ok', data: result })
}

export default getUsers

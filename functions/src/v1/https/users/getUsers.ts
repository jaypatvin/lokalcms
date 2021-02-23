import { Request, Response } from 'express'
import { UsersService } from '../../../service'

const getUsers = async (req: Request, res: Response) => {
  const data = req.body

  const options: any = {}
  if (data.community_id) options.community_id = data.community_id

  const result = await UsersService.getUsers(options)

  if (!result.length) return res.status(204).json({ status: 'ok', data: result, message: 'No users' })

  result.forEach(user => {
    delete user.keywords
    delete user.community
  })

  return res.json({ status: 'ok', data: result })
}

export default getUsers

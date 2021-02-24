import { Request, Response } from 'express'
import { UsersService } from '../../../service'

const getUser = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId) return res.status(400).json({ status: 'error', message: 'userId is required!' })

  const result = await UsersService.getUserByID(userId)

  if (!result) return res.status(204).json({ status: 'ok', data: result, message: 'User does not exist!' })

  // reduce return data
  delete result.keywords
  delete result.community

  return res.json({ status: 'ok', data: result })
}

export default getUser

import { Request, Response } from 'express'
import { UsersService } from '../../../service'

const getUser = async (req: Request, res: Response) => {
  const data = req.body
  if (!data.id) return res.status(400).json({ status: 'error', message: 'User ID is required!' })

  const result = await UsersService.getUserByID(data.id)

  if (!result) return res.status(204).json({ status: 'ok', data: result, message: 'User does not exist!' })

  // reduce return data
  delete result.keywords

  return res.json({ status: 'ok', data: result })
}

export default getUser

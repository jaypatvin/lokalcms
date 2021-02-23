import { Request, Response } from 'express'
import { CommunityService } from '../../../service'

const getCommunity = async (req: Request, res: Response) => {
  const data = req.body
  if (!data.id) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const result = await CommunityService.getCommunityByID(data.id)

  if (!result) return res.status(204).json({ status: 'ok', data: result, message: 'community does not exist!' })

  // reduce return data
  delete result.keywords

  return res.json({ status: 'ok', data: result })
}

export default getCommunity

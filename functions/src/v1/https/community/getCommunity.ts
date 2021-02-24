import { Request, Response } from 'express'
import { CommunityService } from '../../../service'

const getCommunity = async (req: Request, res: Response) => {
  const { communityId } = req.params
  if (!communityId) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const result = await CommunityService.getCommunityByID(communityId)

  if (!result) return res.status(404).json({ status: 'error', data: result, message: 'community does not exist!' })

  // reduce return data
  delete result.keywords

  return res.json({ status: 'ok', data: result })
}

export default getCommunity

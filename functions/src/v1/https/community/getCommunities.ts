import { Request, Response } from 'express'
import { CommunityService } from '../../../service'

const getCommunities = async (req: Request, res: Response) => {
  const result = await CommunityService.getCommunities()

  if (!result.length) return res.status(204).json({ status: 'ok', data: result, message: 'No communities' })

  result.forEach(user => {
    delete user.keywords
  })

  return res.json({ status: 'ok', data: result })
}

export default getCommunities

import { Request, Response } from 'express'
import { UsersService } from '../../../service'

const getUsersByCommunityId = async (req: Request, res: Response) => {
  const { communityId } = req.params

  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'communityId is required!' })

  const result = await UsersService.getUsersByCommunityId(communityId)

  result.forEach(user => {
    delete user.keywords
    delete user.community
  })

  return res.json({ status: 'ok', data: result })
}

export default getUsersByCommunityId

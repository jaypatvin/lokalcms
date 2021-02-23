import { Request, Response } from 'express'
import { CommunityService } from '../../../service'

const deleteCommunity = async (req: Request, res: Response) => {
  const data = req.body
  if (!data.id)
    return res.status(400).json({ status: 'error', message: 'Community ID is required!' })
  const { id: community_id, name } = data

  let result: any = ''
  if (data.hard_delete) {
    result = await CommunityService.deleteCommunity(community_id)
  } else {
    result = await CommunityService.archiveCommunity(community_id)
  }

  return res.json({
    status: 'ok',
    data: result,
    message: `Community ${name || community_id} successfully ${
      data.hard_delete ? 'deleted' : 'archived'
    }.`,
  })
}

export default deleteCommunity

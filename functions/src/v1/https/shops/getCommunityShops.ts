import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

const getCommunityShops = async (req: Request, res: Response) => {
  const data = req.body
  const { communityId } = req.params

  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'communityId is required!' })

  const shops = await ShopsService.getShopsByCommunityID(communityId)

  // reduce return data
  shops.forEach((shop) => {
    delete shop.keywords
  })

  return res.json({ status: 'ok', data: shops })
}

export default getCommunityShops

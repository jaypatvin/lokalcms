import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

const getCommunityShops = async (req: Request, res: Response) => {
  const data = req.body

  if (!data.community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required!' })

  const shops = await ShopsService.getShopsByCommunityID(data.community_id)

  // reduce return data
  shops.forEach((shop) => {
    delete shop.keywords
  })

  return res.json({ status: 'ok', data: shops })
}

export default getCommunityShops

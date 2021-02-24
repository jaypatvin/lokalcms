import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

const getUserShops = async (req: Request, res: Response) => {
  const { userId } = req.params

  if (!userId)
    return res.status(400).json({ status: 'error', message: 'userId is required!' })

  const shops = await ShopsService.getShopsByUserID(userId)

  // reduce return data
  shops.forEach((shop) => {
    delete shop.keywords
  })

  return res.json({ status: 'ok', data: shops })
}

export default getUserShops

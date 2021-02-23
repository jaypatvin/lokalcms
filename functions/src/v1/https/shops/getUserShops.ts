import { Request, Response } from 'express'
import { ShopsService } from '../../../service'

const getUserShops = async (req: Request, res: Response) => {
  const data = req.body

  if (!data.user_id)
    return res.status(400).json({ status: 'error', message: 'user_id is required!' })

  const shops = await ShopsService.getShopsByUserID(data.user_id)

  // reduce return data
  shops.forEach((shop) => {
    delete shop.keywords
  })

  return res.json({ status: 'ok', data: shops })
}

export default getUserShops

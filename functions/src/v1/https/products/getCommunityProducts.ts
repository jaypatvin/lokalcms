import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

const getCommunityProducts = async (req: Request, res: Response) => {
  const data = req.body

  if (!data.community_id)
    return res.status(400).json({ status: 'error', message: 'community_id is required!' })

  const products = await ProductsService.getProductsByCommunityID(data.community_id)

  // reduce return data
  products.forEach((product) => {
    delete product.keywords
  })

  return res.json({ status: 'ok', data: products })
}

export default getCommunityProducts

import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

const getCommunityProducts = async (req: Request, res: Response) => {
  const { communityId } = req.params

  if (!communityId)
    return res.status(400).json({ status: 'error', message: 'communityId is required!' })

  const products = await ProductsService.getProductsByCommunityID(communityId)

  // reduce return data
  products.forEach((product) => {
    delete product.keywords
  })

  return res.json({ status: 'ok', data: products })
}

export default getCommunityProducts

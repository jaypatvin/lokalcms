import { Request, Response } from 'express'
import { ShopsService, ProductsService } from '../../../service'

const getShopDetails = async (req: Request, res: Response) => {
  const data = req.body

  if (!data.id) return res.status(400).json({ status: 'error', message: 'id is required!' })

  const shop = await ShopsService.getShopByID(data.id)

  const products = await ProductsService.getProductsByShopID(data.id)

  // reduce return data
  delete shop.keywords
  products.forEach((product) => delete product.keywords)
  shop.products = products

  return res.json({ status: 'ok', data: shop })
}

export default getShopDetails

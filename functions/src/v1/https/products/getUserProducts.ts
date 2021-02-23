import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

const getUserProducts = async (req: Request, res: Response) => {
  const data = req.body

  if (!data.user_id)
    return res.status(400).json({ status: 'error', message: 'user_id is required!' })

  const products = await ProductsService.getProductsByUserId(data.user_id)

  // reduce return data
  products.forEach((product) => {
    delete product.keywords
  })

  return res.json({ status: 'ok', data: products })
}

export default getUserProducts

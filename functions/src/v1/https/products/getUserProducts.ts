import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

const getUserProducts = async (req: Request, res: Response) => {
  const data = req.body
  const { userId } = req.params

  if (!userId)
    return res.status(400).json({ status: 'error', message: 'userId is required!' })

  const products = await ProductsService.getProductsByUserId(userId)

  // reduce return data
  products.forEach((product) => {
    delete product.keywords
  })

  return res.json({ status: 'ok', data: products })
}

export default getUserProducts

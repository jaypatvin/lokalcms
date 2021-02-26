import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

const getProduct = async (req: Request, res: Response) => {
  const { productId } = req.params

  // check if product exists
  const product = await ProductsService.getProductByID(productId)
  if (!product) return res.status(404).json({ status: 'error', message: 'Product does not exist!' })

  // reduce return data
  delete product.keywords

  return res.status(200).json({ status: 'ok', data: product })
}

export default getProduct

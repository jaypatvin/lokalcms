import { Request, Response } from 'express'
import { ProductsService } from '../../../service'

const getProduct = async (req: Request, res: Response) => {
  const params = req.params
  let _product

  // check if product exists
  _product = await ProductsService.getProductByID(params.id)
  if (!_product) return res.status(404).json({ status: 'error', message: 'Invalid Product Id!' })

  let _result = await _product.get().then((doc) => doc.data())

  return res.status(200).json({ status: 'ok', data: _result })
}

export default getProduct

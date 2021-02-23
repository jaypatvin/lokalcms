import { Request, Response } from 'express'

const deleteProduct = async (req: Request, res: Response) => {
  res.json({ status: 'ok' })
}

export default deleteProduct

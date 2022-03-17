import { Request, Response } from 'express'

const getProducts = async (req: Request, res: Response) => {
  return res.status(200).json({ status: 'ok' })
}

export default getProducts

import { Request, Response } from 'express'

const deleteShop = async (req: Request, res: Response) => {
  res.json({ status: 'ok' })
}

export default deleteShop

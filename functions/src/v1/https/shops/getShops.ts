import { Request, Response } from 'express'

const getShops = async (req: Request, res: Response) => {
  return res.json({ status: 'ok' })
}

export default getShops

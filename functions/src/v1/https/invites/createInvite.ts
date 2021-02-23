import { Request, Response } from 'express'

const createInvite = async (req: Request, res: Response) => {
  res.json({ status: 'ok' })
}

export default createInvite

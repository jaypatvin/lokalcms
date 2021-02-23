import { Request, Response } from 'express'

const getInvites = async (req: Request, res: Response) => {
  return res.json({ status: 'ok' })
}

export default getInvites

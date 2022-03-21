import { RequestHandler } from 'express'

const getInvites: RequestHandler = async (req, res) => {
  return res.json({ status: 'ok' })
}

export default getInvites

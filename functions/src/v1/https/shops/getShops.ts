import { RequestHandler } from 'express'

const getShops: RequestHandler = async (req, res) => {
  return res.json({ status: 'ok' })
}

export default getShops

import { RequestHandler } from 'express'

const getProducts: RequestHandler = async (req, res) => {
  return res.status(200).json({ status: 'ok' })
}

export default getProducts

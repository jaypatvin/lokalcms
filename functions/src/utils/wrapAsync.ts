import { RequestHandler } from 'express'

const wrapAsync = (fn: RequestHandler): RequestHandler => {
  const wrapper: RequestHandler = async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }

  return wrapper
}

export default wrapAsync

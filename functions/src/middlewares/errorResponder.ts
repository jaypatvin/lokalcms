import { NextFunction, Request, Response } from 'express'
import { get } from 'lodash'
import { ErrorCode } from '../utils/generateError'

const errorResponder = async (err: any, req: Request, res: Response, next: NextFunction) => {
  const errorCode = get(err, 'code')
  switch (errorCode) {
    case ErrorCode.ValidationError:
      res.status(400).json(err)
      break
    default:
      break
  }
}

export default errorResponder

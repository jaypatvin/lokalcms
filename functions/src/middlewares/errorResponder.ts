import { ErrorRequestHandler } from 'express'
import { get } from 'lodash'
import { ErrorCode } from '../utils/generateError'

const errorResponder: ErrorRequestHandler = async (err, req, res, next) => {
  const errorCode = get(err, 'code')
  switch (errorCode) {
    case ErrorCode.UnauthorizedError:
      res.status(403).json(err)
      break
    case ErrorCode.ValidationError:
    case ErrorCode.UserApiError:
      res.status(400).json(err)
      break
    default:
      res.status(500).json(err)
      break
  }
}

export default errorResponder

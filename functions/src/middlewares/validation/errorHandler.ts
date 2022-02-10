import { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'express-json-validator-middleware'

const errorHandler = async (error: any, request: Request, response: Response, next: NextFunction) => {
  // Check the error is a validation error
  if (error instanceof ValidationError) {
    // Handle the error
    response.status(400).send(error.validationErrors)
    next()
  } else {
    // Pass error on if not a validation error
    next(error)
  }
}

export default errorHandler

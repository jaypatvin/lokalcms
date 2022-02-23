import { NextFunction, Request, Response } from 'express'
import { ValidationError } from 'express-json-validator-middleware'

const errorHandler = async (err: any, request: Request, response: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    const errorFields = err.validationErrors.body.reduce((acc, error) => {
      switch (error.keyword) {
        case 'required':
          // @ts-ignore
          acc[error.params.missingProperty] = 'missing required property'
          break
        case 'isNotEmpty':
          acc[error.dataPath.substring(1)] = 'cannot be empty string'
          break
        case 'additionalProperties':
          // @ts-ignore
          acc[error.params.additionalProperty] = error.message
          break
        case 'enum':
          // @ts-ignore
          acc[error.dataPath.substring(1)] = `should be one of ${error.params.allowedValues}`
          break
        case 'type':
        case 'format':
        case 'pattern':
        case 'maxLength':
        case 'minLength':
        case 'maxItems':
        case 'minItems':
          acc[error.dataPath.substring(1)] = error.message
          break
        default:
          break
      }
      return acc
    }, {})

    response.status(400).json({
      status: 'error',
      error_fields: errorFields,
    })
    next()
  } else {
    next(err)
  }
}

export default errorHandler

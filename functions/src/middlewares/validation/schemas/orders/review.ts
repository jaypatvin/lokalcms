import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['rating'],
  properties: {
    message: {
      type: 'string',
      maxLength: 255,
    },
    rating: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

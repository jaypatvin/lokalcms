import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['order_id', 'rating'],
  properties: {
    message: {
      type: 'string',
      maxLength: 255,
    },
    order_id: {
      type: 'string',
      maxLength: 100,
    },
    rating: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
    },
  },
  additionalProperties: false,
}

export default schema

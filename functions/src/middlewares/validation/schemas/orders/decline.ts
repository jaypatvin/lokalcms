import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    seller_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    reason: {
      type: 'string',
      maxLength: 255,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

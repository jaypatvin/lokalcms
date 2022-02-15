import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['members'],
  properties: {
    user_id: {
      type: 'string',
      maxLength: 100,
    },
    members: {
      type: 'array',
      items: {
        type: 'string',
        maxLength: 100,
      },
      minItems: 2,
    },
    title: {
      type: 'string',
      maxLength: 100,
    },
    shop_id: {
      type: 'string',
      maxLength: 100,
    },
    product_id: {
      type: 'string',
      maxLength: 100,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

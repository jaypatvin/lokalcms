import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['products', 'shop_id', 'delivery_date', 'delivery_option'],
  properties: {
    products: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'quantity'],
        properties: {
          id: {
            type: 'string',
            maxLength: 100,
          },
          quantity: {
            type: 'integer',
            minimum: 0,
          },
          instruction: {
            type: 'string',
            maxLength: 255,
          },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
    buyer_id: {
      type: 'string',
      maxLength: 100,
    },
    shop_id: {
      type: 'string',
      maxLength: 100,
    },
    delivery_option: {
      type: 'string',
      enum: ['delivery', 'pickup'],
    },
    delivery_date: {
      type: 'string',
      maxLength: 100,
    },
    instruction: {
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

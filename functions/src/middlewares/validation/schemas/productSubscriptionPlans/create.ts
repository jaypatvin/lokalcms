import { AllowedSchema } from 'express-json-validator-middleware'
import { datePattern, repeatTypes } from '../utils'

const schema: AllowedSchema = {
  type: 'object',
  required: ['product_id', 'shop_id', 'quantity', 'plan', 'payment_method'],
  properties: {
    product_id: {
      type: 'string',
      maxLength: 100,
    },
    shop_id: {
      type: 'string',
      maxLength: 100,
    },
    buyer_id: {
      type: 'string',
      maxLength: 100,
    },
    quantity: {
      type: 'integer',
      minimum: 1,
    },
    instruction: {
      type: 'string',
      maxLength: 255,
    },
    payment_method: {
      type: 'string',
      enum: ['cod', 'bank', 'e-wallet'],
    },
    plan: {
      type: 'object',
      required: ['start_dates', 'repeat_unit', 'repeat_type'],
      properties: {
        start_dates: {
          type: 'array',
          items: {
            type: 'string',
            pattern: datePattern,
          },
          minItems: 1,
        },
        last_date: {
          type: 'string',
          pattern: datePattern,
        },
        repeat_unit: {
          type: 'integer',
          minimum: 1,
        },
        repeat_type: {
          type: 'string',
          enum: repeatTypes,
        },
        auto_reschedule: {
          type: 'boolean',
        },
        override_dates: {
          type: 'array',
          items: {
            type: 'object',
            required: ['original_date', 'new_date'],
            properties: {
              original_date: {
                type: 'string',
                pattern: datePattern,
              },
              new_date: {
                type: 'string',
                pattern: datePattern,
              },
            },
            additionalProperties: false,
          },
          minItems: 1,
        },
      },
      additionalProperties: false,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

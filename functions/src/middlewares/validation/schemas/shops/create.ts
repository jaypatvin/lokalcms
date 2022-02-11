import { AllowedSchema } from 'express-json-validator-middleware'
import { datePattern, timePattern, repeatTypes } from '../utils'

const schema: AllowedSchema = {
  type: 'object',
  required: ['delivery_options', 'description', 'name', 'operating_hours', 'user_id'],
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    description: {
      type: 'string',
      maxLength: 255,
    },
    user_id: {
      type: 'string',
      maxLength: 100,
    },
    is_close: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      enum: ['enabled', 'disabled'],
    },
    delivery_options: {
      type: 'object',
      required: ['delivery', 'pickup'],
      properties: {
        delivery: {
          type: 'boolean',
        },
        pickup: {
          type: 'boolean',
        },
      },
      additionalProperties: false,
    },
    payment_options: {
      type: 'array',
      items: {
        type: 'object',
        required: ['bank_code', 'account_name', 'account_number'],
        properties: {
          bank_code: {
            type: 'string',
            maxLength: 100,
          },
          account_name: {
            type: 'string',
            maxLength: 100,
          },
          account_number: {
            type: 'string',
            maxLength: 100,
          },
        },
      },
    },
    operating_hours: {
      type: 'object',
      required: ['start_time', 'end_time', 'start_dates', 'repeat_unit', 'repeat_type'],
      properties: {
        start_time: {
          type: 'string',
          pattern: timePattern,
        },
        end_time: {
          type: 'string',
          pattern: timePattern,
        },
        start_dates: {
          type: 'array',
          items: {
            type: 'string',
            pattern: datePattern,
          },
          minItems: 1,
        },
        repeat_unit: {
          type: 'integer',
        },
        repeat_type: {
          type: 'string',
          enum: repeatTypes,
        },
        unavailable_dates: {
          type: 'array',
          items: {
            type: 'string',
            pattern: datePattern,
          },
        },
        custom_dates: {
          type: 'array',
          items: {
            type: 'object',
            required: ['date'],
            properties: {
              date: {
                type: 'string',
                pattern: datePattern,
              },
              start_time: {
                type: 'string',
                pattern: timePattern,
              },
              end_time: {
                type: 'string',
                pattern: timePattern,
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
  },
  additionalProperties: false,
}

export default schema

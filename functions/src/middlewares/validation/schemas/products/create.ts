import { AllowedSchema } from 'express-json-validator-middleware'
import { datePattern, timePattern, repeatTypes } from '../utils'

const schema: AllowedSchema = {
  type: 'object',
  required: ['name', 'description', 'shop_id', 'base_price', 'quantity', 'product_category'],
  properties: {
    name: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    description: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 255,
    },
    shop_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    base_price: {
      type: 'number',
      minimum: 0,
    },
    quantity: {
      type: 'integer',
      minimum: 0,
    },
    product_category: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    status: {
      type: 'string',
      enum: ['enabled', 'disabled'],
    },
    can_subscribe: {
      type: 'boolean',
    },
    gallery: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            isNotEmpty: true,
            format: 'uri',
          },
          order: {
            type: 'integer',
            minimum: 0,
          },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
    availability: {
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
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

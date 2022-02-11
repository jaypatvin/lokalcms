import { AllowedSchema } from 'express-json-validator-middleware'
import { datePattern, timePattern, repeatTypes } from '../utils'

const schema: AllowedSchema = {
  type: 'object',
  required: ['shop_id'],
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    description: {
      type: 'string',
      maxLength: 255,
    },
    shop_id: {
      type: 'string',
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
            format: 'uri',
          },
          order: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
    },
  },
  anyOf: [
    { required: ['name'] },
    { required: ['description'] },
    { required: ['base_price'] },
    { required: ['quantity'] },
    { required: ['product_category'] },
    { required: ['status'] },
    { required: ['can_subscribe'] },
    { required: ['gallery'] },
  ],
  additionalProperties: false,
}

export default schema

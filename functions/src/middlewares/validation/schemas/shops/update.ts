import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    description: {
      type: 'string',
      maxLength: 255,
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
  },
  anyOf: [
    { required: ['name'] },
    { required: ['description'] },
    { required: ['is_close'] },
    { required: ['status'] },
    { required: ['delivery_options'] },
    { required: ['payment_options'] },
  ],
  additionalProperties: false,
}

export default schema

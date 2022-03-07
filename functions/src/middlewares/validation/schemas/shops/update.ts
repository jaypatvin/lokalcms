import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
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
            isNotEmpty: true,
            maxLength: 100,
          },
          account_name: {
            type: 'string',
            isNotEmpty: true,
            maxLength: 100,
          },
          account_number: {
            type: 'string',
            isNotEmpty: true,
            maxLength: 100,
          },
        },
      },
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
    profile_photo: {
      type: 'string',
      isNotEmpty: true,
      format: 'uri',
    },
    cover_photo: {
      type: 'string',
      isNotEmpty: true,
      format: 'uri',
    },
  },
  anyOf: [
    { required: ['name'] },
    { required: ['description'] },
    { required: ['is_close'] },
    { required: ['status'] },
    { required: ['delivery_options'] },
    { required: ['payment_options'] },
    { required: ['profile_photo'] },
    { required: ['cover_photo'] },
  ],
  additionalProperties: false,
}

export default schema

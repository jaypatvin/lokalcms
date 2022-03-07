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
        isNotEmpty: true,
        maxLength: 100,
      },
      minItems: 2,
    },
    title: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    shop_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    product_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    message: {
      type: 'string',
    },
    media: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            isNotEmpty: true,
            format: 'uri',
          },
          type: {
            type: 'string',
            enum: ['image', 'audio', 'video'],
          },
          order: {
            type: 'integer',
            minimum: 0,
          },
        },
      },
      minItems: 1,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [{ required: ['message'] }, { required: ['media'] }],
  additionalProperties: false,
}

export default schema

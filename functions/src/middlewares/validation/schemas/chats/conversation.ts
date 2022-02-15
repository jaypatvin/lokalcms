import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['members'],
  properties: {
    user_id: {
      type: 'string',
      maxLength: 100,
    },
    reply_to: {
      type: 'string',
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

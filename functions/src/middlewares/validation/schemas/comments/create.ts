import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['user_id'],
  properties: {
    user_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    message: {
      type: 'string',
    },
    images: {
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
      },
      minItems: 1,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [{ required: ['message'] }, { required: ['images'] }],
  additionalProperties: false,
}

export default schema

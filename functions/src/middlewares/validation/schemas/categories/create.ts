import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    description: {
      type: 'string',
      maxLength: 255,
    },
    icon_url: {
      type: 'string',
      format: 'uri',
    },
    cover_url: {
      type: 'string',
      format: 'uri',
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

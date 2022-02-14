import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
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
  anyOf: [{ required: ['description'] }, { required: ['icon_url'] }, { required: ['cover_url'] }],
  additionalProperties: false,
}

export default schema

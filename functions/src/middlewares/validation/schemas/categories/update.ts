import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    description: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 255,
    },
    icon_url: {
      type: 'string',
      isNotEmpty: true,
      format: 'uri',
    },
    cover_url: {
      type: 'string',
      isNotEmpty: true,
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

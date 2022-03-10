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
      anyOf: [
        {
          type: 'string',
          format: 'uri',
        },
        {
          const: '',
        },
      ],
    },
    cover_url: {
      anyOf: [
        {
          type: 'string',
          format: 'uri',
        },
        {
          const: '',
        },
      ],
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

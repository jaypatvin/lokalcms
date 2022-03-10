import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    barangay: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    city: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    state: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    subdivision: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    zip_code: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    country: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    profile_photo: {
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
    cover_photo: {
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
    admin: {
      type: 'array',
      items: {
        type: 'string',
        isNotEmpty: true,
        maxLength: 100,
      },
      minItems: 1,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [
    { required: ['name'] },
    { required: ['barangay'] },
    { required: ['city'] },
    { required: ['state'] },
    { required: ['subdivision'] },
    { required: ['zip_code'] },
    { required: ['country'] },
    { required: ['profile_photo'] },
    { required: ['cover_photo'] },
  ],
  additionalProperties: false,
}

export default schema

import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['name', 'barangay', 'city', 'state', 'subdivision', 'zip_code', 'country'],
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
      type: 'string',
      format: 'uri',
    },
    cover_photo: {
      type: 'string',
      format: 'uri',
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
  additionalProperties: false,
}

export default schema

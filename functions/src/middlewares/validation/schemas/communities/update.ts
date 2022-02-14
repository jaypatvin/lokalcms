import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      maxLength: 100,
    },
    barangay: {
      type: 'string',
      maxLength: 100,
    },
    city: {
      type: 'string',
      maxLength: 100,
    },
    state: {
      type: 'string',
      maxLength: 100,
    },
    subdivision: {
      type: 'string',
      maxLength: 100,
    },
    zip_code: {
      type: 'string',
      maxLength: 100,
    },
    country: {
      type: 'string',
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

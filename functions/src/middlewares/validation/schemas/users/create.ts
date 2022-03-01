import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['email', 'first_name', 'last_name', 'street', 'community_id'],
  properties: {
    email: {
      type: 'string',
      isNotEmpty: true,
      format: 'email',
      maxLength: 100,
    },
    first_name: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    last_name: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    street: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    community_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    display_name: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    is_admin: {
      type: 'boolean',
    },
    profile_photo: {
      type: 'string',
      isNotEmpty: true,
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

import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    first_name: {
      type: 'string',
      maxLength: 100,
    },
    last_name: {
      type: 'string',
      maxLength: 100,
    },
    street: {
      type: 'string',
      maxLength: 100,
    },
    community_id: {
      type: 'string',
      maxLength: 100,
    },
    display_name: {
      type: 'string',
      maxLength: 100,
    },
    is_admin: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      enum: ['active', 'suspended', 'pending', 'locked'],
    },
    profile_photo: {
      type: 'string',
      format: 'uri',
    },
  },
  anyOf: [
    { required: ['first_name'] },
    { required: ['last_name'] },
    { required: ['street'] },
    { required: ['community_id'] },
    { required: ['display_name'] },
    { required: ['is_admin'] },
    { required: ['status'] },
    { required: ['profile_photo'] },
  ],
  additionalProperties: false,
}

export default schema

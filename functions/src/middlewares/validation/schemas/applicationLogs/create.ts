import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['community_id', 'action_type', 'device_id'],
  properties: {
    community_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    action_type: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    device_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    associated_document: {
      type: 'string',
      maxLength: 100,
    },
    metadata: {
      type: 'object',
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

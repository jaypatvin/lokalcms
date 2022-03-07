import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['code'],
  properties: {
    user_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    code: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

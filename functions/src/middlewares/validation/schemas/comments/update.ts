import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['message'],
  properties: {
    message: {
      type: 'string',
      isNotEmpty: true,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

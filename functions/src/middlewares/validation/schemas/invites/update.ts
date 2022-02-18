import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    claimed: {
      type: 'boolean',
    },
    status: {
      type: 'string',
      enum: ['enabled', 'disabled'],
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [{ required: ['email'] }, { required: ['claimed'] }, { required: ['status'] }],
  additionalProperties: false,
}

export default schema

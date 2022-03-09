import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    status: {
      type: 'string',
      enum: ['enabled', 'disabled'],
    },
    message: {
      type: 'string',
      isNotEmpty: true,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [{ required: ['message'] }, { required: ['status'] }],
  additionalProperties: false,
}

export default schema

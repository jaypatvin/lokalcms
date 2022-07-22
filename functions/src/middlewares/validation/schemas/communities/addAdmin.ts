import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['user_id'],
  properties: {
    user_id: {
      type: 'string',
    },
  },
  additionalProperties: false,
}

export default schema

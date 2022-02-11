import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['notes'],
  properties: {
    notes: {
      type: 'string',
      maxLength: 255,
    },
  },
  additionalProperties: false,
}

export default schema

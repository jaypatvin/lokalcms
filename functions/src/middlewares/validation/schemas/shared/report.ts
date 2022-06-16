import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['description'],
  properties: {
    description: {
      type: 'string',
    },
  },
  additionalProperties: false,
}

export default schema

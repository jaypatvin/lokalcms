import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['minDate', 'maxDate'],
  properties: {
    minDate: {
      type: 'string',
      format: 'date-time'
    },
    maxDate: {
      type: 'string',
    },
  },
  additionalProperties: false,
}

export default schema

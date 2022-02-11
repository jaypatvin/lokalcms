import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    show_read_receipts: {
      type: 'boolean',
    },
  },
  anyOf: [{ required: ['show_read_receipts'] }],
  additionalProperties: false,
}

export default schema

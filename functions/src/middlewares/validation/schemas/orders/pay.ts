import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['payment_method', 'proof_of_payment'],
  properties: {
    buyer_id: {
      type: 'string',
      maxLength: 100,
      isNotEmpty: true,
    },
    payment_method: {
      type: 'string',
      enum: ['cod', 'bank', 'e-wallet'],
    },
    proof_of_payment: {
      type: 'string',
      isNotEmpty: true,
      format: 'uri',
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  if: {
    properties: {
      payment_method: {
        not: { const: 'cod' },
      },
    },
  },
  then: {
    required: ['proof_of_payment'],
  },
  additionalProperties: false,
}

export default schema

import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['buyer_id', 'payment_method'],
  properties: {
    buyer_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    proof_of_payment: {
      type: 'string',
      isNotEmpty: true,
      format: 'uri',
    },
    payment_method: {
      type: 'string',
      enum: ['cod', 'bank', 'e-wallet'],
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

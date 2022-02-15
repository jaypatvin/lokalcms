import { AllowedSchema } from 'express-json-validator-middleware'
import { datePattern } from '../utils'

const schema: AllowedSchema = {
  type: 'object',
  required: ['override_dates'],
  properties: {
    override_dates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['original_date', 'new_date'],
        properties: {
          original_date: {
            type: 'string',
            pattern: datePattern,
          },
          new_date: {
            type: 'string',
            pattern: datePattern,
          },
        },
        additionalProperties: false,
      },
      minItems: 1,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

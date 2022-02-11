import { AllowedSchema } from 'express-json-validator-middleware'
import { datePattern, timePattern, repeatTypes } from '../utils'

const schema: AllowedSchema = {
  type: 'object',
  required: ['start_time', 'end_time', 'start_dates', 'repeat_unit', 'repeat_type'],
  properties: {
    start_time: {
      type: 'string',
      pattern: timePattern,
    },
    end_time: {
      type: 'string',
      pattern: timePattern,
    },
    start_dates: {
      type: 'array',
      items: {
        type: 'string',
        pattern: datePattern,
      },
      minItems: 1,
    },
    repeat_unit: {
      type: 'integer',
    },
    repeat_type: {
      type: 'string',
      enum: repeatTypes,
    },
    unavailable_dates: {
      type: 'array',
      items: {
        type: 'string',
        pattern: datePattern,
      },
    },
    custom_dates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['date'],
        properties: {
          date: {
            type: 'string',
            pattern: datePattern,
          },
          start_time: {
            type: 'string',
            pattern: timePattern,
          },
          end_time: {
            type: 'string',
            pattern: timePattern,
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
}

export default schema

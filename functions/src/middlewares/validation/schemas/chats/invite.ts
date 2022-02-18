import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    user_id: {
      type: 'string',
      isNotEmpty: true,
      maxLength: 100,
    },
    new_members: {
      type: 'array',
      items: {
        type: 'string',
        isNotEmpty: true,
        maxLength: 100,
      },
      minItems: 1,
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [{ required: ['user_id'] }, { required: ['new_members'] }],
  additionalProperties: false,
}

export default schema

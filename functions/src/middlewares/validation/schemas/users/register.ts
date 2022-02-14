import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  required: ['id_type', 'id_photo'],
  properties: {
    id_type: {
      type: 'string',
      maxLength: 100,
    },
    id_photo: {
      type: 'string',
      format: 'uri',
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  additionalProperties: false,
}

export default schema

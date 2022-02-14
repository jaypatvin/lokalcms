import { AllowedSchema } from 'express-json-validator-middleware'

const schema: AllowedSchema = {
  type: 'object',
  properties: {
    likes: {
      type: 'boolean',
    },
    comments: {
      type: 'boolean',
    },
    tags: {
      type: 'boolean',
    },
    messages: {
      type: 'boolean',
    },
    order_status: {
      type: 'boolean',
    },
    community_alerts: {
      type: 'boolean',
    },
    subscriptions: {
      type: 'boolean',
    },
    products: {
      type: 'boolean',
    },
    source: {
      type: 'string',
      enum: ['cms', 'api', 'app', ''],
    },
  },
  anyOf: [
    { required: ['likes'] },
    { required: ['comments'] },
    { required: ['tags'] },
    { required: ['messages'] },
    { required: ['order_status'] },
    { required: ['community_alerts'] },
    { required: ['subscriptions'] },
    { required: ['products'] },
  ],
  additionalProperties: false,
}

export default schema

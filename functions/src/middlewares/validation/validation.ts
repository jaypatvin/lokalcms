import { Validator } from 'express-json-validator-middleware'
import {
  ProductsSchema,
  ShopsSchema,
  UsersSchema,
} from './schemas'

const { validate } = new Validator({ allErrors: true })

export const user = {
  chatSettings: validate({ body: UsersSchema.chatSettings }),
  create: validate({ body: UsersSchema.create }),
  notification: validate({ body: UsersSchema.notification }),
  register: validate({ body: UsersSchema.register }),
  unverify: validate({ body: UsersSchema.unverify }),
  update: validate({ body: UsersSchema.update }),
  verify: validate({ body: UsersSchema.verify }),
}

export const shop = {
  create: validate({ body: ShopsSchema.create }),
  update: validate({ body: ShopsSchema.update }),
  operatingHours: validate({ body: ShopsSchema.operatingHours }),
}

export const product = {
  create: validate({ body: ProductsSchema.create }),
  update: validate({ body: ProductsSchema.update }),
  availability: validate({ body: ProductsSchema.availability }),
  review: validate({ body: ProductsSchema.review }),
}

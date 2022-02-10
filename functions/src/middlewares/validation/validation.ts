import { Validator } from 'express-json-validator-middleware'
import { UsersSchema } from './schemas'

const { validate } = new Validator({ allErrors: true })

export const user = {
  create: validate({ body: UsersSchema.create }),
  update: validate({ body: UsersSchema.update }),
  register: validate({ body: UsersSchema.register }),
}

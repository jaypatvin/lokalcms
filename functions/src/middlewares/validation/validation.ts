import { Validator } from 'express-json-validator-middleware'
import {
  ActivitiesSchema,
  ApplicationLogsSchema,
  CategoriesSchema,
  ChatsSchema,
  CommentsSchema,
  CommunitiesSchema,
  InvitesSchema,
  OrdersSchema,
  ProductsSchema,
  ProductSubscriptionPlansSchema,
  ProductSubscriptionsSchema,
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

export const community = {
  create: validate({ body: CommunitiesSchema.create }),
  update: validate({ body: CommunitiesSchema.update }),
}

export const invite = {
  create: validate({ body: InvitesSchema.create }),
  update: validate({ body: InvitesSchema.update }),
  claim: validate({ body: InvitesSchema.claim }),
}

export const category = {
  create: validate({ body: CategoriesSchema.create }),
  update: validate({ body: CategoriesSchema.update }),
}

export const activity = {
  create: validate({ body: ActivitiesSchema.create }),
  update: validate({ body: ActivitiesSchema.update }),
}

export const comment = {
  create: validate({ body: CommentsSchema.create }),
  update: validate({ body: CommentsSchema.update }),
}

export const applicationLog = {
  create: validate({ body: ApplicationLogsSchema.create }),
}

export const chat = {
  create: validate({ body: ChatsSchema.create }),
  conversation: validate({ body: ChatsSchema.conversation }),
  invite: validate({ body: ChatsSchema.invite }),
  removeUser: validate({ body: ChatsSchema.removeUser }),
  title: validate({ body: ChatsSchema.title }),
}

export const order = {
  create: validate({ body: OrdersSchema.create }),
  cancel: validate({ body: OrdersSchema.cancel }),
  decline: validate({ body: OrdersSchema.decline }),
  pay: validate({ body: OrdersSchema.pay }),
}

export const productSubscriptionPlan = {
  create: validate({ body: ProductSubscriptionPlansSchema.create }),
  overrideDates: validate({ body: ProductSubscriptionPlansSchema.overrideDates }),
}

export const productSubscription = {
  order: validate({ body: ProductSubscriptionsSchema.order }),
}

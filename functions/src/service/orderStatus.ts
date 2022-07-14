import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  createById: baseCreateById,
  update: baseUpdate,
} = createBaseMethods(db.orderStatus)

export { findAll, findByCommunityId, findById }

export const create = (id: string, data) => baseCreateById(id, data)
export const update = (id: string, data) => baseUpdate(id, data)

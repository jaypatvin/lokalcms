import { CategoryCreateData, CategoryUpdateData } from '../models/Category'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  createById: baseCreateById,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.categories)

export { findAll, findByCommunityId, findById }

export const create = (id: string, data: CategoryCreateData) => baseCreateById(id, data)
export const update = (id: string, data: CategoryUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data) => baseArchive(id, data)
export const unarchive = (id: string, data) => baseUnarchive(id, data)

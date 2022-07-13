import { BankCodeCreateData } from '../models/BankCode'
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
} = createBaseMethods(db.bankCodes)

export { findAll, findByCommunityId, findById }

export const create = (id: string, data: BankCodeCreateData) => baseCreateById(id, data)
export const update = (id: string, data: BankCodeCreateData) => baseUpdate(id, data)
export const archive = (id: string) => baseArchive(id)
export const unarchive = (id: string) => baseUnarchive(id)

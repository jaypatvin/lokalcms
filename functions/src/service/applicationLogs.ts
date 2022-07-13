import { where } from 'firebase/firestore'
import { ApplicationLogCreateData } from '../models/ApplicationLog'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.applicationLogs)

export { findAll, findByCommunityId, findById }

export const create = (data: ApplicationLogCreateData) => baseCreate(data)
export const archive = (id: string) => baseArchive(id)
export const unarchive = (id: string) => baseUnarchive(id)

export const findUserApplicationLogs = async (user_id: string) => {
  return await findAll({
    wheres: [where('user_id', '==', user_id)],
  })
}

export const findApplicationLogsByAssociatedDocument = async (document_id: string) => {
  return await findAll({
    wheres: [where('associated_document', '==', document_id)],
  })
}

export const findApplicationLogsByAssociatedDocumentAndActionType = async (
  document_id: string,
  action_type: string
) => {
  return await findAll({
    wheres: [
      where('associated_document', '==', document_id),
      where('action_type', '==', action_type),
    ],
  })
}

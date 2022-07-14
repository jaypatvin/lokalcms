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

export const findUserApplicationLogs = async (userId: string) => {
  return await findAll({
    wheres: [where('user_id', '==', userId)],
  })
}

export const findApplicationLogsByAssociatedDocument = async (documentId: string) => {
  return await findAll({
    wheres: [where('associated_document', '==', documentId)],
  })
}

export const findApplicationLogsByAssociatedDocumentAndActionType = async (
  documentId: string,
  action_type: string
) => {
  return await findAll({
    wheres: [
      where('associated_document', '==', documentId),
      where('action_type', '==', action_type),
    ],
  })
}

import { where } from 'firebase/firestore'
import { ChatCreateData, ChatUpdateData } from '../models/Chat'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  createById: baseCreateById,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.chats)

export { findAll, findByCommunityId, findById }

export const create = (data: ChatCreateData) => baseCreate(data)
export const update = (id: string, data: ChatUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: ChatUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: ChatUpdateData) => baseUnarchive(id, data)

export const findGroupChatByHash = async (groupHash: string) => {
  return await findAll({
    wheres: [where('group_hash', '==', groupHash)],
  })
}

export const createChatWithHashId = (id: string, data: ChatCreateData) => baseCreateById(id, data)

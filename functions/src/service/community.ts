import { where } from 'firebase/firestore'
import { CommunityCreateData, CommunityUpdateData } from '../models/Community'
import db from '../utils/db'
import { createBaseMethods } from './base'

const {
  findAll,
  findById,
  findByCommunityId,
  create: baseCreate,
  update: baseUpdate,
  archive: baseArchive,
  unarchive: baseUnarchive,
} = createBaseMethods(db.community)

export { findAll, findByCommunityId, findById }

export const create = (data: CommunityCreateData) => baseCreate(data)
export const update = (id: string, data: CommunityUpdateData) => baseUpdate(id, data)
export const archive = (id: string, data: CommunityUpdateData) => baseArchive(id, data)
export const unarchive = (id: string, data: CommunityUpdateData) => baseUnarchive(id, data)

export const findCommunitiesByName = async (name: string) => {
  return await findAll({
    wheres: [where('name', '==', name)],
  })
}

type NameAndAddressArgs = {
  name: string
  subdivision: string
  city: string
  barangay: string
  zip_code: string
}

export const findCommunitiesByNameAndAddress = async (options: NameAndAddressArgs) => {
  const { name, subdivision, city, barangay, zip_code } = options
  return await findAll({
    wheres: [
      where('name', '==', name),
      where('address.subdivision', '==', subdivision),
      where('address.city', '==', city),
      where('address.barangay', '==', barangay),
      where('address.zip_code', '==', zip_code),
    ],
  })
}

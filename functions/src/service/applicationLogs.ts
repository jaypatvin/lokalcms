import db from '../utils/db'

export const getCommunityApplicationLogs = async (community_id: string) => {
  return await db.applicationLogs
    .where('community_id', '==', community_id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getUserApplicationLogs = async (user_id: string) => {
  return await db.applicationLogs
    .where('user_id', '==', user_id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getApplicationLogsByAssociatedDocument = async (document_id: string) => {
  return await db.applicationLogs
    .where('associated_document', '==', document_id)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const getApplicationLogsByAssociatedDocumentAndActionType = async (
  document_id: string,
  action_type: string
) => {
  return await db.applicationLogs
    .where('associated_document', '==', document_id)
    .where('action_type', '==', action_type)
    .get()
    .then((res) => res.docs.map((doc): any => ({ id: doc.id, ...doc.data() })))
}

export const createApplicationLog = async (data) => {
  return await db.applicationLogs
    .add({ ...data, created_at: new Date(), archived: false })
    .then((res) => {
      return res
    })
}

export const archiveApplicationLog = async (id: string, data?: any) => {
  let updateData = { archived: true, archived_at: new Date(), updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.applicationLogs.doc(id).update(updateData)
}

export const unarchiveApplicationLog = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: new Date() }
  if (data) updateData = { ...updateData, ...data }
  return await db.applicationLogs.doc(id).update(updateData)
}

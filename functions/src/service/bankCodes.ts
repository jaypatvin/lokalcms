import { BankCodeCreateData } from '../models/BankCode'
import db from '../utils/db'

export const getAllCategories = async () => {
  return await db.bankCodes
    .get()
    .then((res) => res.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
}

export const getBankCodeById = async (id) => {
  const bankCode = await db.bankCodes.doc(id).get()

  const data = bankCode.data()
  if (data) return { id: bankCode.id, ...data } as any
  return null
}

export const createBankCode = async (data: BankCodeCreateData) => {
  return await db.bankCodes
    .doc(data.name)
    .set({ ...data, created_at: FirebaseFirestore.Timestamp.now() })
    .then((res) => res)
    .then(() => db.bankCodes.doc(data.name).get())
    .then((doc) => ({ ...doc.data(), id: doc.id }))
}

export const updateBankCode = async (id, data) => {
  return await db.bankCodes
    .doc(id)
    .update({ ...data, updated_at: FirebaseFirestore.Timestamp.now() })
}

export const archiveBankCode = async (id: string, data?: any) => {
  let updateData = {
    archived: true,
    archived_at: FirebaseFirestore.Timestamp.now(),
    updated_at: FirebaseFirestore.Timestamp.now(),
  }
  if (data) updateData = { ...updateData, ...data }
  return await db.bankCodes.doc(id).update(updateData)
}

export const unarchiveBankCode = async (id: string, data?: any) => {
  let updateData = { archived: false, updated_at: FirebaseFirestore.Timestamp.now() }
  if (data) updateData = { ...updateData, ...data }
  return await db.bankCodes.doc(id).update(updateData)
}

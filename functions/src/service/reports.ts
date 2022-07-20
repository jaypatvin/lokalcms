import { ReportCreateData } from '../models/Report'
import db from '../utils/db'
import { createBaseMethods } from './base'

export const createActivityReport = (id: string, data: ReportCreateData) => {
  return createBaseMethods(db.getActivityReports(`activities/${id}/reports`)).create(data)
}

export const createShopReport = (id: string, data: ReportCreateData) => {
  return createBaseMethods(db.getShopReports(`shops/${id}/reports`)).create(data)
}

export const createProductReport = (id: string, data: ReportCreateData) => {
  return createBaseMethods(db.getProductReports(`products/${id}/reports`)).create(data)
}

export const createCommunityReport = async (id: string, data: ReportCreateData) => {
  return await db
    .getCommunityReports(`community/${id}/reports`)
    .add({ ...data, created_at: admin.firestore.Timestamp.now() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

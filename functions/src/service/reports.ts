import * as admin from 'firebase-admin'
import { ReportCreateData } from '../models/Report'
import db from '../utils/db'

export const createActivityReport = async (id: string, data: ReportCreateData) => {
  return await db
    .getActivityReports(`activities/${id}/reports`)
    .add({ ...data, created_at: admin.firestore.Timestamp.now() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

export const createProductReport = async (id: string, data: ReportCreateData) => {
  return await db
    .getProductReports(`products/${id}/reports`)
    .add({ ...data, created_at: admin.firestore.Timestamp.now() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ id: doc.id, ...doc.data() }))
}

export const createShopReport = async (id: string, data: ReportCreateData) => {
  return await db
    .getShopReports(`shops/${id}/reports`)
    .add({ ...data, created_at: admin.firestore.Timestamp.now() })
    .then((res) => {
      return res.get()
    })
    .then((doc) => ({ id: doc.id, ...doc.data() }))
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

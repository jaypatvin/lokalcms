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
  return createBaseMethods(db.getCommunityReports(`community/${id}/reports`)).create(data)
}

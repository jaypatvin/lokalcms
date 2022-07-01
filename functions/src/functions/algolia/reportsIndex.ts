import * as functions from 'firebase-functions'
import algoliasearch from 'algoliasearch'
import { get, pick } from 'lodash'
import { reportFields } from './algoliaFields'
import db from '../../utils/db'

const appId = get(functions.config(), 'algolia_config.app_id')
const apiKey = get(functions.config(), 'algolia_config.api_key')
const client = algoliasearch(appId, apiKey)

const reportsIndex = client.initIndex('reports')

exports.addReportIndex = functions.firestore
  .document('{collection}/{docId}/reports/{reportId}')
  .onCreate(async (snapshot) => {
    const data = snapshot.data()

    const userRef = await db.users.doc(data.user_id).get()
    const reportedUserRef = await db.users.doc(data.reported_user_id).get()
    const userEmail = userRef.data().email
    const reportedUserEmail = reportedUserRef.data().email

    const report = {
      objectID: snapshot.id,
      ...pick(data, reportFields),
      reporter_email: userEmail,
      reported_email: reportedUserEmail,
    }

    return reportsIndex.saveObject(report)
  })

exports.updateReportIndex = functions.firestore
  .document('{collection}/{docId}/reports/{reportId}')
  .onUpdate(async (change) => {
    const newData = change.after.data()

    const extraFields: any = {}

    if (!newData.reporter_email) {
      const userRef = await db.users.doc(newData.user_id).get()
      const userEmail = userRef.data().email
      extraFields.reporter_email = userEmail
    }

    if (!newData.reported_email) {
      const reportedUserRef = await db.users.doc(newData.reported_user_id).get()
      const reportedUserEmail = reportedUserRef.data().email
      extraFields.reported_email = reportedUserEmail
    }

    const report = {
      objectID: change.after.id,
      ...pick(newData, reportFields),
      ...extraFields,
    }

    return reportsIndex.saveObject(report)
  })

exports.deleteReportIndex = functions.firestore
  .document('{collection}/{docId}/reports/{reportId}')
  .onDelete((snapshot) => {
    return reportsIndex.deleteObject(snapshot.id)
  })

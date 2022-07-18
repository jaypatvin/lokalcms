import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const reportFields = [
  'user_id',
  'reported_user_id',
  'description',
  'community_id',
  'activity_id',
  'shop_id',
  'product_id',
  'created_at',
  'updated_at',
  'report_type',
  'document_snapshot',
  'reporter_email',
  'reported_email',
]

const importReports = async (client: SearchClient) => {
  const reportsIndex = client.initIndex('reports')

  const reportsRef = await db.collectionGroup('reports').get()
  const reportDocs: any = []

  for (const report of reportsRef.docs) {
    const reportData = report.data()

    const userRef = await db.collection('users').doc(reportData.user_id).get()
    const reportedUserRef = await db.collection('users').doc(reportData.reported_user_id).get()
    const userEmail = userRef.data()!.email
    const reportedUserEmail = reportedUserRef.data()!.email

    reportDocs.push({
      objectID: report.id,
      ...pick(reportData, reportFields),
      reporter_email: userEmail,
      reported_email: reportedUserEmail,
    })
  }

  try {
    await reportsIndex.saveObjects(reportDocs)
    await reportsIndex.setSettings({
      searchableAttributes: [
        'description',
        'reported_email',
        'reporter_email',
        'document_snapshot.name',
        'document_snapshot.message',
      ],
      ranking: [
        'desc(created_at._seconds)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
      attributesForFaceting: [
        'filterOnly(activity_id)',
        'filterOnly(community_id)',
        'filterOnly(product_id)',
        'filterOnly(report_type)',
        'filterOnly(reported_user_id)',
        'filterOnly(shop_id)',
        'filterOnly(user_id)',
      ],
    })
    console.log('reports imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importReports

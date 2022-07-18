import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const activityFields = [
  '_meta',
  'archived',
  'archived_at',
  'community_id',
  'created_at',
  'images',
  'message',
  'status',
  'updated_at',
  'user_id',
]

const commentFields = [
  'archived',
  'archived_at',
  'activity_id',
  'community_id',
  'created_at',
  'images',
  'message',
  'status',
  'updated_at',
  'user_id',
]

const importActivitiesAndComments = async (client: SearchClient) => {
  const activitiesIndex = client.initIndex('activities')
  const activitiesCreatedAtDescIndex = client.initIndex('activities_created_at_desc')

  const commentsIndex = client.initIndex('comments')
  const commentsCreatedAtDescIndex = client.initIndex('comments_created_at_desc')

  const activitiesRef = await db.collection('activities').get()
  const activityDocs: any = []
  const commentDocs: any = []

  for (const activity of activitiesRef.docs) {
    const activityData = activity.data()

    activityDocs.push({
      objectID: activity.id,
      ...pick(activityData, activityFields),
    })

    const commentsRef = await db.collection('activities').doc(activity.id).collection('comments').get()

    for (const comment of commentsRef.docs) {
      const commentData = comment.data()

      commentDocs.push({
        objectID: comment.id,
        ...pick(commentData, commentFields),
        activity_id: activity.id,
      })
    }
  }

  try {
    await activitiesIndex.saveObjects(activityDocs)
    await activitiesIndex.setSettings(
      {
        replicas: ['activities_created_at_desc'],
      },
    )
    await activitiesIndex.setSettings(
      {
        searchableAttributes: [
          'message',
        ],
        ranking: [
          'asc(created_at._seconds)',
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
          'filterOnly(archived)',
          'filterOnly(community_id)',
          'filterOnly(status)',
          'filterOnly(user_id)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await activitiesCreatedAtDescIndex.setSettings({
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
    })
    console.log('activities imported to algolia')

    await commentsIndex.saveObjects(commentDocs)
    await commentsIndex.setSettings(
      {
        replicas: ['comments_created_at_desc'],
      },
    )
    await commentsIndex.setSettings(
      {
        searchableAttributes: [
          'message',
        ],
        ranking: [
          'asc(created_at._seconds)',
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
          'filterOnly(archived)',
          'filterOnly(activity_id)',
          'filterOnly(status)',
          'filterOnly(user_id)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await commentsCreatedAtDescIndex.setSettings({
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
    })
    console.log('comments imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importActivitiesAndComments

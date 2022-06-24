import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const userFields = [
  '_meta',
  'address',
  'archived',
  'birthdate',
  'community_id',
  'created_at',
  'display_name',
  'email',
  'first_name',
  'last_name',
  'profile_photo',
  'registration',
  'roles',
  'status',
  'updated_at',
]

const importUsers = async (client: SearchClient) => {
  const usersIndex = client.initIndex('users')
  const usersNameDescIndex = client.initIndex('users_name_desc')
  const usersCreatedAtAscIndex = client.initIndex('users_created_at_asc')
  const usersCreatedAtDescIndex = client.initIndex('users_created_at_desc')

  const usersRef = await db.collection('users').get()
  const userDocs = usersRef.docs.map((doc): any => {
    const userData = doc.data()
    return {
      objectID: doc.id,
      ...pick(userData, userFields),
    }
  })

  try {
    await usersIndex.saveObjects(userDocs)
    await usersIndex.setSettings(
      {
        replicas: ['users_name_desc', 'users_created_at_desc', 'users_created_at_asc'],
      },
    )
    await usersIndex.setSettings(
      {
        searchableAttributes: [
          'address.street',
          'display_name',
          'email',
          'first_name',
          'last_name',
        ],
        ranking: [
          'asc(display_name)',
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
          'filterOnly(roles.admin)',
          'filterOnly(roles.editor)',
          'filterOnly(status)',
        ],
      },
      {
        forwardToReplicas: true,
      }
    )
    await usersNameDescIndex.setSettings({
      ranking: [
        'desc(display_name)',
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
    await usersCreatedAtAscIndex.setSettings({
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
    })
    await usersCreatedAtDescIndex.setSettings({
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
    console.log('users imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importUsers

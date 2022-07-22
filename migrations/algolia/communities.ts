import * as admin from 'firebase-admin'
import { SearchClient } from 'algoliasearch'
import { pick } from 'lodash'

const db = admin.firestore()

const communityFields = [
  '_meta',
  'archived',
  'address',
  'admins',
  'cover_photo',
  'created_at',
  'name',
  'profile_photo',
  'updated_at',
]

const importCommunities = async (client: SearchClient) => {
  const communitiesIndex = client.initIndex('communities')
  const communitiesNameDescIndex = client.initIndex('communities_name_desc')
  const communitiesCreatedAtAscIndex = client.initIndex('communities_created_at_asc')
  const communitiesCreatedAtDescIndex = client.initIndex('communities_created_at_desc')

  const communitiesRef = await db.collection('community').get()
  const communityDocs: any = []

  for (const community of communitiesRef.docs) {
    const communityData = community.data()

    communityDocs.push({
      objectID: community.id,
      ...pick(communityData, communityFields),
    })
  }

  try {
    await communitiesIndex.saveObjects(communityDocs)
    await communitiesIndex.setSettings({
      replicas: [
        'communities_name_desc',
        'communities_created_at_desc',
        'communities_created_at_asc',
      ],
    })
    await communitiesIndex.setSettings(
      {
        searchableAttributes: [
          'address.subdivision',
          'address.barangay',
          'address.city',
          'address.zip_code',
          'name',
        ],
        ranking: [
          'asc(name)',
          'typo',
          'geo',
          'words',
          'filters',
          'proximity',
          'attribute',
          'exact',
          'custom',
        ],
        attributesForFaceting: ['filterOnly(archived)'],
      },
      {
        forwardToReplicas: true,
      }
    )
    await communitiesNameDescIndex.setSettings({
      ranking: [
        'desc(name)',
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
    await communitiesCreatedAtAscIndex.setSettings({
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
    await communitiesCreatedAtDescIndex.setSettings({
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
    console.log('communities imported to algolia')
  } catch (error) {
    console.error(error)
  }
  return
}

export default importCommunities

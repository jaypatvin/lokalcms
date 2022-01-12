import Chance from 'chance'
import { Activity } from '../../models'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import { AdminType } from '../dbseed'
import * as samples from '../sampleImages'

const chance = new Chance()

const seedActivityLikes = async ({
  activity,
  admin,
}: {
  activity: Activity & { id: string }
  admin: AdminType
}) => {
  const users = (await db.users.where('community_id', '==', activity.community_id).get()).docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  )
  for (const user of users) {
    if (chance.bool()) {
      await sleep(100)
      try {
        await db
          .getLikes(`activities/${activity.id}/likes`)
          .doc(`${activity.id}_${user.id}_like`)
          .set({
            parent_collection_path: 'activities',
            parent_collection_name: 'activities',
            user_id: user.id,
            activity_id: activity.id,
            created_at: admin.firestore.Timestamp.now(),
          })
      } catch (error) {
        console.error('Error creating activity like:', error)
      }
    }
  }
}

const seedActivityComments = async ({
  activity,
  admin,
}: {
  activity: Activity & { id: string }
  admin: AdminType
}) => {
  const users = (await db.users.where('community_id', '==', activity.community_id).get()).docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  )
  for (const user of users) {
    if (chance.bool()) {
      await sleep(100)
      try {
        const numOfImages = chance.integer({ min: 0, max: 2 })
        const images = [...Array(numOfImages).keys()].map((order) => ({
          order,
          url: chance.pickone(samples.comments),
        }))
        await db.getActivityComments(`activities/${activity.id}/comments`).add({
          archived: false,
          created_at: admin.firestore.Timestamp.now(),
          images,
          message: chance.sentence(),
          status: chance.pickone(['enabled', 'disabled']),
          user_id: user.id,
        })
      } catch (error) {
        console.error('Error creating activity comment:', error)
      }
    }
  }
}

export const seedActivities = async ({ admin }: { admin: AdminType }) => {
  const users = (await db.users.get()).docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  for (const user of users) {
    if (chance.bool({ likelihood: 70 })) {
      const numOfImages = chance.integer({ min: 0, max: 5 })
      const images = [...Array(numOfImages).keys()].map((order) => ({
        order,
        url: chance.pickone(samples.activities),
      }))
      const numOfActivities = chance.integer({ min: 0, max: 3 })
      try {
        for (let i = 1; i <= numOfActivities; i++) {
          await sleep(100)
          const activity = await db.activities
            .add({
              archived: false,
              community_id: user.community_id,
              images,
              message: chance.sentence(),
              status: chance.pickone(['enabled', 'disabled']),
              user_id: user.id,
              created_at: admin.firestore.Timestamp.now(),
            })
            .then((res) => res.get())
            .then((doc) => ({ id: doc.id, ...doc.data() }))

          await seedActivityLikes({ activity, admin })
          await seedActivityComments({ activity, admin })
        }
      } catch (error) {
        console.error('Error creating activity:', error)
      }
    }
  }
}

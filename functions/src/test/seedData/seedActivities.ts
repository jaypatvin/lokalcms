import Chance from 'chance'
import { getDocs, Timestamp, where, query, doc, setDoc, addDoc, getDoc } from 'firebase/firestore'
import { Activity } from '../../models'
import db from '../../utils/db'
import sleep from '../../utils/sleep'
import * as samples from '../sampleImages'

const chance = new Chance()

const seedActivityLikes = async ({ activity }: { activity: Activity & { id: string } }) => {
  const users = (
    await getDocs(query(db.users, where('community_id', '==', activity.community_id)))
  ).docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  for (const user of users) {
    if (chance.bool()) {
      await sleep(100)
      try {
        await setDoc(
          doc(db.getLikes(`activities/${activity.id}/likes`), `${activity.id}_${user.id}_like`),
          {
            parent_collection_path: 'activities',
            parent_collection_name: 'activities',
            user_id: user.id,
            community_id: user.community_id,
            activity_id: activity.id,
            created_at: Timestamp.now(),
          }
        )
      } catch (error) {
        console.error('Error creating activity like:', error)
      }
    }
  }
}

const seedActivityComments = async ({ activity }: { activity: Activity & { id: string } }) => {
  const users = (
    await getDocs(query(db.users, where('community_id', '==', activity.community_id)))
  ).docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  for (const user of users) {
    if (chance.bool()) {
      await sleep(100)
      try {
        const numOfImages = chance.integer({ min: 0, max: 2 })
        const images = [...Array(numOfImages).keys()].map((order) => ({
          order,
          url: chance.pickone(samples.comments),
        }))
        await addDoc(db.getActivityComments(`activities/${activity.id}/comments`), {
          archived: false,
          created_at: Timestamp.now(),
          images,
          message: chance.sentence(),
          status: chance.pickone(['enabled', 'disabled']),
          user_id: user.id,
          activity_id: activity.id,
        })
      } catch (error) {
        console.error('Error creating activity comment:', error)
      }
    }
  }
}

export const seedActivities = async () => {
  const users = (await getDocs(db.users)).docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
  const randomUsers = chance.pickset(users, 15)
  for (const user of randomUsers) {
    const numOfImages = chance.integer({ min: 0, max: 5 })
    const images = [...Array(numOfImages).keys()].map((order) => ({
      order,
      url: chance.pickone(samples.activities),
    }))
    const numOfActivities = chance.integer({ min: 0, max: 3 })
    try {
      for (let i = 1; i <= numOfActivities; i++) {
        await sleep(100)

        const activityDoc = await getDoc(
          await addDoc(db.activities, {
            archived: false,
            community_id: user.community_id,
            images,
            message: chance.sentence(),
            status: chance.pickone(['enabled', 'disabled']),
            user_id: user.id,
            created_at: Timestamp.now(),
          })
        )
        const activity = { id: activityDoc.id, ...activityDoc.data() }

        // @ts-ignore
        await seedActivityLikes({ activity })
        // @ts-ignore
        await seedActivityComments({ activity })
      }
    } catch (error) {
      console.error('Error creating activity:', error)
    }
  }
}

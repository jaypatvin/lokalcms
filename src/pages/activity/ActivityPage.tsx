import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/Avatar'
import { Activity, User } from '../../models'
import { fetchActivityByID } from '../../services/activities'
import { fetchCommunityByID } from '../../services/community'
import { fetchUserByID } from '../../services/users'

type Props = {
  [x: string]: any
}

type ActivityData = Activity & {
  id: string
  community_name?: string
  user_email?: string
}

const ActivityPage = ({ match }: Props) => {
  const [activity, setActivity] = useState<ActivityData>()
  const [user, setUser] = useState<User>()

  useEffect(() => {
    setupData()
  }, [match.params])

  const setupData = async () => {
    await fetchActivity(match.params.id)
  }

  const fetchActivity = async (id: string) => {
    const activityRef = await fetchActivityByID(id)
    const activityRefData = activityRef.data()
    if (activityRefData) {
      const activityData = {
        ...activityRefData,
        id: activityRef.id,
        community_name: '',
        user_email: '',
      }
      const community = await fetchCommunityByID(activityData.community_id)
      const communityData = community.data()
      if (communityData) {
        activityData.community_name = communityData.name
      }
      const user = await fetchUserByID(activityData.user_id)
      const userData = user.data()
      if (userData) {
        activityData.user_email = userData.email
        setUser(userData)
      }
      setActivity(activityData)
    }
  }

  return (
    <div className="container">
      <div className="shadow p-5 mx-auto max-w-xl">
        <p className="text-sm text-secondary-400">
          Community{' '}
          <Link to={`/communities/${activity?.community_id}`}>
            <span className="text-primary-600">{activity?.community_name}</span>
          </Link>
        </p>
        <div className="flex items-center gap-2 w-full my-2">
          <div className="w-16">
            <Avatar url={user?.profile_photo} name={user?.display_name} size={16} />
          </div>
          <div>
            {activity?.message ? <p>{activity.message}</p> : ''}
            {activity?.images?.length ? (
              <img
                className="block max-h-36 mt-2"
                src={activity.images[0].url}
                alt={activity.message}
              />
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <Link to={`/users/${activity?.user_id}`}>
            <p className="text-primary-600 text-xs">{activity?.user_email}</p>
          </Link>
          <p className="text-right text-xs text-secondary-400">
            {dayjs(activity?.created_at.toDate()).format('dddd, MMMM D YYYY h:mma')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ActivityPage

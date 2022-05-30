import dayjs from 'dayjs'
import { debounce } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Avatar from '../../components/Avatar'
import { TextField } from '../../components/inputs'
import { useAuth } from '../../contexts/AuthContext'
import { Activity, Like, User } from '../../models'
import { fetchActivityByID } from '../../services/activities'
import { CommentsResponse, getActivityComments } from '../../services/comments'
import { fetchCommunityByID } from '../../services/community'
import { fetchUserByID } from '../../services/users'
import { SortOrderType } from '../../utils/types'

type Props = {
  [x: string]: any
}

type ActivityData = Activity & {
  id: string
  community_name?: string
  user_email?: string
}

const ActivityPage = ({ match }: Props) => {
  const limit = 2
  const { firebaseToken } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [sortOrder, setSortOrder] = useState<SortOrderType>('asc')
  const [activity, setActivity] = useState<ActivityData>()
  const [comments, setComments] = useState<(CommentsResponse['data'][0] & { user: User })[]>([])
  const [likes, setLikes] = useState<Like[]>([])
  const [user, setUser] = useState<User>()

  useEffect(() => {
    setupData()
  }, [match.params])

  useEffect(() => {
    if (activity) {
      fetchComments(activity.id).then(setComments)
    }
  }, [search, sortOrder])

  useEffect(() => {
    if (activity) {
      if (page === 0) {
        fetchComments(activity.id).then(setComments)
      } else {
        fetchComments(activity.id).then((data) => setComments([...comments, ...data]))
      }
    }
  }, [page])

  const fetchComments = async (activityId: string) => {
    if (firebaseToken) {
      const activityComments: any = await getActivityComments(
        {
          activity: activityId,
          search,
          sort: {
            sortBy: 'created_at',
            sortOrder: sortOrder,
          },
          page,
          limit,
        },
        firebaseToken
      )
      for (const comment of activityComments?.data ?? []) {
        comment.user = (await fetchUserByID(comment.user_id)).data()
      }
      return activityComments.data
    }
    return []
  }

  const showMore = () => {
    if (comments.length < (activity?._meta?.comments_count ?? 0)) {
      setPage(page + 1)
    }
  }

  const sortHandler = (order: SortOrderType) => {
    setSortOrder(order)
    setPage(0)
  }

  const debouncedSearch = debounce((value: string) => {
    setSearch(value)
  }, 300)

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

      setComments(await fetchComments(activityData.id))

      if (activityRefData.likes) {
        const likesData = (await activityRefData.likes.get()).docs.map((doc) => doc.data())
        setLikes(likesData)
      }
    }
  }

  return (
    <div className="container">
      <div className="shadow p-5 mx-auto w-160">
        <p className="text-sm text-secondary-400">
          Community{' '}
          <Link to={`/communities/${activity?.community_id}`}>
            <span className="text-primary-600">{activity?.community_name}</span>
          </Link>
        </p>
        <div className="flex gap-2 w-full my-2">
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
      <div className="shadow mt-2 mx-auto w-144 overflow-y-auto h-128 relative">
        <div className="p-2 sticky top-0 left-0 bg-white z-10 border-b">
          <div className="flex justify-between">
            <p className="mb-1 text-secondary-400 text-sm">
              Comments {comments.length} of {activity?._meta?.comments_count ?? 0}
            </p>
            <div>
              <button
                className={`text-xs text-${sortOrder === 'asc' ? 'primary' : 'secondary'}-500`}
                onClick={() => sortHandler('asc')}
              >
                Asc
              </button>
              <button
                className={`text-xs text-${
                  sortOrder === 'desc' ? 'primary' : 'secondary'
                }-500 ml-2`}
                onClick={() => sortHandler('desc')}
              >
                Desc
              </button>
            </div>
          </div>
          <TextField
            type="text"
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Search"
            size="small"
            noMargin
          />
          {comments.length < (activity?._meta?.comments_count ?? 0) ? (
            <button className="text-xs text-primary-500" onClick={showMore}>
              Show more
            </button>
          ) : (
            ''
          )}
        </div>
        {comments.map((comment) => (
          <div key={comment.id} className="border-b mb-2 p-2">
            <div className="flex gap-2 w-full my-2">
              <div className="w-16">
                <Avatar
                  url={comment.user.profile_photo}
                  name={comment.user?.display_name}
                  size={16}
                />
              </div>
              <div>
                {comment?.message ? <p>{comment.message}</p> : ''}
                {comment?.images?.length ? (
                  <img
                    className="block max-h-36 mt-2"
                    src={comment.images[0].url}
                    alt={comment.message}
                  />
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="flex justify-between">
              <Link to={`/users/${comment.user_id}`}>
                <p className="text-primary-600 text-xs">{comment.user.email}</p>
              </Link>
              <p className="text-right text-xs text-secondary-400">
                {dayjs(comment.created_at as unknown as Date).format('dddd, MMMM D YYYY h:mma')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityPage

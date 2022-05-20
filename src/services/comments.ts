import { SortOrderType, CommentSortByType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { Comment } from '../models'

export type CommentFilterType = {
  status: string
  archived?: boolean
}

export type CommentSort = {
  sortBy: CommentSortByType
  sortOrder: SortOrderType
}

type GetCommentsParamTypes = {
  search?: string
  filter?: CommentFilterType
  sort?: CommentSort
  limit?: number
  page?: number
  community?: string
  activity: string
}

export const fetchCommentByID = async (id: string) => {
  return db.activities.doc(id).get()
}

export type CommentsResponse = {
  pages: number
  totalItems: number
  data: (Comment & { id: string })[]
}

export const getActivityComments = async (
  {
    activity,
    search = '',
    filter = { status: 'all', archived: false },
    sort = { sortBy: 'created_at', sortOrder: 'desc' },
    limit = 10,
    page = 0,
    community,
  }: GetCommentsParamTypes,
  firebaseToken: string
): Promise<CommentsResponse | undefined> => {
  let params: any = {
    limit,
    page,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
  }
  if (search) {
    params.q = search
  }
  if (community) {
    params.community = community
  }
  if (activity) {
    params.activity = activity
  }
  if (filter.status !== 'all') {
    params.status = filter.status
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/comments?${searchParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${firebaseToken}`,
        },
        method: 'get',
      })
    ).json()
    return res
  }

  console.error('environment variable for the api does not exist.')
}

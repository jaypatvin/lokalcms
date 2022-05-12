import { UserSortByType, SortOrderType } from '../utils/types'
import { db } from '../utils'
import { API_URL } from '../config/variables'
import { User } from '../models'

export const getUsersByCommunity = (community_id: string, limit = 10) => {
  return db.users
    .where('community_id', '==', community_id)
    .where('archived', '==', false)
    .orderBy('created_at', 'desc')
    .limit(limit)
}

export const fetchUserByID = async (id: string) => {
  return db.users.doc(id).get()
}

export const fetchUserByUID = async (uid = '') => {
  try {
    // valid login
    const userRef = db.users
    const userId = await userRef
      .where('user_uids', 'array-contains', uid)
      .get()
      .then((res) => res.docs.map((doc) => doc.id))

    if (userId.length === 0) {
      return false
    }
    // fetch user info
    const userInfoRef = await db.users.doc(userId[0]).get()
    if (!userInfoRef.exists) {
      return false
    }

    return userInfoRef
  } catch (error) {
    console.log(error)
    return false
  }
}

export type UserFilterType = {
  status: string
  role: string
  archived?: boolean
}

export type UserSort = {
  sortBy: UserSortByType
  sortOrder: SortOrderType
}

type GetUsersParamTypes = {
  filter?: UserFilterType
  search?: string
  sort?: UserSort
  limit?: number
  page?: number
  community?: string
}

export type UsersResponse = {
  pages: number
  totalItems: number
  data: (User & { id: string })[]
}

export const getUsers = async (
  {
    filter = { status: 'all', role: 'all', archived: false },
    search = '',
    sort = { sortBy: 'display_name', sortOrder: 'asc' },
    limit = 50,
    page = 0,
    community,
  }: GetUsersParamTypes,
  firebaseToken: string
): Promise<UsersResponse | undefined> => {
  // let ref = db.users.where('keywords', 'array-contains', search.toLowerCase())

  // if (community) {
  //   ref = ref.where('community_id', '==', community)
  // }

  // if (filter.status !== 'all') {
  //   ref = ref.where('status', '==', filter.status)
  // }
  // if (filter.role !== 'all') {
  //   ref = ref.where(`roles.${filter.role}`, '==', true)
  // }

  // ref = ref.orderBy(sort.sortBy, sort.sortOrder).limit(limit)

  // return ref
  let params: any = {
    limit,
    page,
  }
  if (search) {
    params.q = search
  }
  if (community) {
    params.community = community
  }
  if (filter.status !== 'all') {
    params.status = filter.status
  }
  if (filter.role !== 'all') {
    params[`role`] = filter.role
  }
  const searchParams = new URLSearchParams(params)
  if (API_URL) {
    const res = await (
      await fetch(`${API_URL}/users?${searchParams}`, {
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

import { UserSortByType, SortOrderType } from '../utils/types'
import { db } from '../utils'

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
  community?: string
}

export const getUsers = ({
  filter = { status: 'all', role: 'all', archived: false },
  search = '',
  sort = { sortBy: 'display_name', sortOrder: 'asc' },
  limit = 50,
  community,
}: GetUsersParamTypes) => {
  let ref = db.users.where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (filter.status !== 'all') {
    ref = ref.where('status', '==', filter.status)
  }
  if (filter.role !== 'all') {
    ref = ref.where(`roles.${filter.role}`, '==', true)
  }

  ref = ref.orderBy(sort.sortBy, sort.sortOrder).limit(limit)

  return ref
}

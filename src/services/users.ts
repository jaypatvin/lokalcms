import { UserSortByType, UserFilterType, SortOrderType } from '../utils/types'
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

type GetUsersParamTypes = {
  filter?: UserFilterType
  search?: string
  sortBy?: UserSortByType
  sortOrder?: SortOrderType
  limit?: number
  community?: string
}

export const getUsers = ({
  filter = 'all',
  search = '',
  sortBy = 'display_name',
  sortOrder = 'asc',
  limit = 50,
  community,
}: GetUsersParamTypes) => {
  let ref = db.users.where('keywords', 'array-contains', search.toLowerCase())

  if (community) {
    ref = ref.where('community_id', '==', community)
  }

  if (filter === 'member') {
    ref = ref.where('roles.admin', '==', false)
  } else if (filter === 'unregistered') {
    ref = ref.where('registration.verified', '==', false)
  } else if (!['all', 'archived'].includes(filter)) {
    ref = ref.where(`roles.${filter}`, '==', true)
  }

  ref = ref
    .where('archived', '==', filter === 'archived')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  return ref
}

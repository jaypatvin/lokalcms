import { UserSortByType, UserRoleType, SortOrderType } from '../utils/types'
import { db, auth } from './firebase'

// export const getAuthUserByUID = async (uid: string) => {
//   try {
//     console.log(uid);
//     return await auth
//                   .getUser(uid)
//                   .then((userRecord) => {
//                     return userRecord
//                   })
//   } catch (e) {
//     console.log(e);
//     return false
//   }
// }

export const fetchUserByID = async (id: string) => {
  return db.collection('users').doc(id).get()
}

export const fetchUserByUID = async (uid = '') => {
  try {
    // valid login
    const userRef = db.collection('users')
    const userId = await userRef
      .where('user_uids', 'array-contains', uid)
      .get()
      .then((res) => res.docs.map((doc) => doc.id))

    if (userId.length === 0) {
      return false
    }
    // fetch user info
    const userInfoRef = await db.collection('users').doc(userId[0]).get()
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
  role?: UserRoleType,
  search?: string
  sortBy?: UserSortByType
  sortOrder?: SortOrderType
  limit?: number
}

export const getUsers = ({
  role = 'all',
  search = '',
  sortBy = 'display_name',
  sortOrder = 'asc',
  limit = 50
}: GetUsersParamTypes) => {
  let ref = db
    .collection('users')
    .where('keywords', 'array-contains', search.toLowerCase())
    .orderBy(sortBy, sortOrder)
    .limit(limit)

  if (role === 'member') {
    ref = ref.where('roles.admin', '==', false)
  } else if (role !== 'all') {
    ref = ref.where(`roles.${role}`, '==', true)
  }

  return ref
}

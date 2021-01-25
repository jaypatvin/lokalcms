import { auth, db } from './firebase';

export const fetchUserByUID = async (uid = false) => {
    try {
      // valid login
      const userRef = db.collection('users');
      const userId = await userRef
                    .where('user_uids', 'array-contains', uid)
                    .get()
                    .then(res => res.docs.map(doc => doc.id));

      if (userId.length === 0) {
        return false;
      }
      // fetch user info
      const userInfoRef = await db.collection('users').doc(userId[0]).get();
      if (!userInfoRef.exists) {
        return false
      } 

      return userInfoRef.data()

    } catch (error) {
      console.log(error);
      return false;
    }
}

export const getUsers = (role="all", search="", sortBy="name", sortOrder="asc", limit = 50) => {
  let ref = db.collection('users')
    .orderBy(sortBy, sortOrder)
    .limit(limit)

    if (['admin', 'member'].indexOf(role) >= 0) {
      ref = ref.where('roles.' + role, '==', true )
    }

  return ref
}

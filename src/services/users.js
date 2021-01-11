import { auth, db } from './firebase';

export const fetchUserByUID = async (uid = false) => {
    try {
      // valid login
      const userRef = db.collection('users');
      const userId = await userRef
                    .where('user_uids', 'array-contains', uid)
                    .get()
                    .then(res => res.docs.map(doc => doc.id));

      console.log(userId.length);

      if (userId.length === 0) {
        return false;
      }

      // fetch user info
      const user = await db.collection('users').doc(userId[0]).get();

      return user.data();

    } catch (error) {
      console.log(error);
      return false;
    }
}

export const signIn = async (email, password) => {
  return await auth.signInWithEmailAndPassword(email, password);
}

export const signOut = async () => {
  await auth.signOut();
}
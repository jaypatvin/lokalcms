import * as admin from 'firebase-admin'

const db = admin.firestore()

export const getCommunityByID = async (id) => {
    return await db
                  .collection('community')
                  .doc(id)
                  .get()
                  .then((res) => {
                      let _ret = res.data()
                      _ret.referencePath = res.ref.path
                      return _ret
                  })
}
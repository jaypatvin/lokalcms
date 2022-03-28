import { db } from './firebase'

export const getAppMeta = () => {
  return db.collection('_meta')
}

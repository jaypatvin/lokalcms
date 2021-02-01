import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import 'firebase/functions'
// @ts-expect-error: this file is not included in the repo
import { config } from './firebase-config'

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(config)
}

const auth = firebase.auth()
const db = firebase.firestore()
const functions = firebase.functions()
const storage = firebase.storage()

export { firebase, auth, db, functions, storage }

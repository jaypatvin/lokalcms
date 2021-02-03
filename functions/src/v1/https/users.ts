import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { getUserByUID, createUser as createNewUser } from '../../service/users'
import { getCommunityByID } from '../../service/community'
import { generateUserKeywords } from '../../utils/generateKeywords'

//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getUsers = async (req, res) => {

  // TODO: return list of users
  const _user = await db.collection('users').doc('aqSJ1egyCHhPx7d3uznWcxylpLi2').get();

  if (!_user.exists) {
    console.log('No document');
    res.json({status: 'error', message: 'Not Found'})
  } else {
    res.json(_user.data())
  }
}

export const createUser = async (req, res) => {

  const data = req.body
  let _authUser
  let _community

  // double check if uid is valid
  try {
    _authUser = await auth
                        .getUser(data.user_uid)
                        .then((userRecord) => {
                          return userRecord
                        })
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid User UID!'})
  }

  // check if community id is valid
  try {
    _community = await getCommunityByID(data.community_id)
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid Community ID!'})
  }
  

  // check if uid already exist in the users' collection
  const _users = await getUserByUID(data.user_uid)


  if (_users.length > 0) {
    return res.json({status: 'error', message: 'User "' + _authUser.email + '" already exist!'})
  }

  const keywords = generateUserKeywords([data.first_name, data.last_name, data.email])

  // create a user
  const _newData = {
    user_uids: [data.user_uid],
    first_name: data.first_name,
    last_name: data.last_name,
    dislay_name: data.first_name + ' ' + data.last_name,
    email: _authUser.email,
    profile_photo: data.profile_photo,
    roles: {
      admin: false,
      member: true
    },
    status: 'active',
    birthdate: '',
    created_at: new Date(),
    registration: {
      id_photo: '',
      id_type: '',
      notes: '',
      step: 0,
      verified: false
    },
    community_id: data.community_id,
    community: db.doc(`community/${data.community_id}`),
    address: {
      barangay: _community.address.barangay,
      street: data.address,
      city: _community.address.city,
      state: _community.address.state,
      subdivision: _community.address.subdivision,
      zip_code: _community.address.zip_code,
      country: _community.address.country
    },
    keywords
  }

  const _newUser = await createNewUser(_newData)

  // get the created user's data
  let _result = await _newUser
                          .get()
                          .then((doc) => {
                            return doc.data()
                          })

  // add the user document id
  _result.id = _newUser.id

  return res.json({status: 'ok', data: _result})
}

export const getUser = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateUser = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteUser = async (req, res) => {

  res.json({status: 'ok'})
}


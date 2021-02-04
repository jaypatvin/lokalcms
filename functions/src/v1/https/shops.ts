import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

import { getUserByID } from '../../service/users'
import { createShop as createNewShop } from '../../service/shops'
import { getCommunityByID } from '../../service/community'

//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getShops = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const createShop = async (req, res) => {

  const data = req.body
  let _user
  let _community

  // check if user id is valid
  try {
    _user = await getUserByID(data.user_id)
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid User ID!'})
  }

  // check if community id is valid
  try {
    _community = await getCommunityByID(data.community_id)
  } catch (e) {
    return res.json({status: 'error', message: 'Invalid Community ID!'})
  }

  const _newData = {
    name: data.name,
    profile_photo: data.profile_photo,
    cover_photo: data.cover_photo,
    description: data.description,
    user_id: data.user_id,
    community_id: data.community_id,
    is_close: data.is_close,
    operating_hours: {
      opening: data.opening,
      closing: data.closing,
      custom: data.use_custom_hours,
    },
    status: data.status,
    created_at: new Date()
  }

  // -----------------
  // TODO:
  // Still figuring out best way to store business hours
  //
  // check custom operating hours
  //
  // if (data.use_custom_hours && data.custom_hours) {
  //   for (let key in data.custom_hours) {
  //     console.log(key);
  //     if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].indexOf(key) >= 0) {
  //       _newData.operating_hours[key] = {
  //         opening: data.custom_hours[key].opening,
  //         closing: data.custom_hours[key].closing
  //       }
  //       console.log(_newData)
  //     }
  //   }
  //}

  const _newShop = await createNewShop(_newData)

  // get the created shop's data
  let _result = await _newShop
                          .get()
                          .then((doc) => {
                            return doc.data()
                          })

  // add the shop document id
  _result.id = _newShop.id

  return res.json({status: 'ok', data: _result})
}

export const getShop = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateShop = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteShop = async (req, res) => {

  res.json({status: 'ok'})
}


import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getCommunities = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const getCommunity = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateCommunity = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteCommunity = async (req, res) => {

  res.json({status: 'ok'})
}


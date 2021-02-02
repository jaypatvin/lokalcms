import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getInvites = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const getInvite = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateInvite = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteInvite = async (req, res) => {

  res.json({status: 'ok'})
}


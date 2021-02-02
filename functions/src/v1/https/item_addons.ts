import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getAddons = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const getAddon = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateAddon = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteAddon = async (req, res) => {

  res.json({status: 'ok'})
}


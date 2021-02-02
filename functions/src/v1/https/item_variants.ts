import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getVariants = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const getVariant = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateVariant = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteVariant = async (req, res) => {

  res.json({status: 'ok'})
}


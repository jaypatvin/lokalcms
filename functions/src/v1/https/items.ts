import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
//admin.initializeApp()

const db = admin.firestore()
const auth = admin.auth()


export const getItems = async (req, res) => {
 
  return res.json({status: 'ok'})
}

export const getItem = async (req, res) => {

  res.json({status: 'ok'})
}


export const updateItem = async (req, res) => {

  res.json({status: 'ok'})
}


export const deleteItem = async (req, res) => {

  res.json({status: 'ok'})
}


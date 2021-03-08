/* eslint-disable import/first */
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
admin.initializeApp()

import { authMiddleware, roleMiddleware } from './middlewares'

import helloRouter from './v1/https/hello.function'
import { runCounter } from './utils/counters'

const app = express()
app.use(cors({ origin: true }))
app.use(compression())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/', helloRouter)

app.use(authMiddleware)
app.use(roleMiddleware)

require('./routes')(app)

exports.api = functions.https.onRequest(app)

// Counter functions
exports.userCounter = functions.firestore
  .document('users/{docId}')
  .onWrite(async (change, context) => {
    return runCounter('users', change, context)
  })
exports.communityCounter = functions.firestore
  .document('community/{docId}')
  .onWrite(async (change, context) => {
    return runCounter('community', change, context)
  })
exports.shopCounter = functions.firestore
  .document('shops/{docId}')
  .onWrite(async (change, context) => {
    return runCounter('shops', change, context)
  })
exports.productCounter = functions.firestore
  .document('products/{docId}')
  .onWrite(async (change, context) => {
    return runCounter('products', change, context)
  })
exports.inviteCounter = functions.firestore
  .document('invites/{docId}')
  .onWrite(async (change, context) => {
    return runCounter('invites', change, context)
  })

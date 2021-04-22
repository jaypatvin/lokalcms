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
import logActivity from './utils/logActivity'
import generateSchedule from './utils/generateSchedule'

// TEMPORARY
// JUST FOR TESTING
const schedTest = generateSchedule({
  start_time: '09:00 am',
  end_time: '06:00 pm',
  start_dates: [new Date('2021-04-19'), new Date('2021-04-21'), new Date('2021-04-23')],
  repeat: 'every_other_week',
  unavailable_dates: [
    new Date('2021-05-03')
  ],
  custom_dates: [
    {
      date: new Date('2021-04-26')
    },
    {
      date: new Date('2021-05-05'),
      start_time: '12:00 pm'
    }
  ]
})

console.log('schedTest', schedTest)

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
    logActivity(change)
    return runCounter('users', change, context)
  })
exports.communityCounter = functions.firestore
  .document('community/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('community', change, context)
  })
exports.shopCounter = functions.firestore
  .document('shops/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('shops', change, context)
  })
exports.productCounter = functions.firestore
  .document('products/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('products', change, context)
  })
exports.inviteCounter = functions.firestore
  .document('invites/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('invites', change, context)
  })
exports.categoryCounter = functions.firestore
  .document('categories/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('categories', change, context)
  })
exports.activityCounter = functions.firestore
  .document('activities/{docId}')
  .onWrite(async (change, context) => {
    logActivity(change)
    return runCounter('activities', change, context)
  })

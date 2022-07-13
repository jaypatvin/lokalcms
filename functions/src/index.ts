/* eslint-disable import/first */
import * as functions from 'firebase-functions'
import { initializeApp } from 'firebase/app'
import * as bodyParser from 'body-parser'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import { config } from './firebase-config.json'
initializeApp(config)

import { authMiddleware, roleMiddleware, errorAlert, errorResponder } from './middlewares'

import helloRouter from './v1/https/hello.function'
import { errorHandler } from './middlewares/validation'

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

app.use(errorHandler)
app.use(errorAlert)
app.use(errorResponder)

exports.api = functions.https.onRequest(app)

exports.algolia = require('./functions/algolia')
exports.counter = require('./functions/counters')
exports.ratings = require('./functions/ratings')
exports.subscriptions = require('./functions/subscriptions')

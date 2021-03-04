/*
# from https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
*/

import { NextFunction, Request, Response } from 'express'
import admin from 'firebase-admin'

const nonSecureAPIs = [
  {
    method: 'get',
    path: '/v1/stream/users',
  },
  {
    method: 'post',
    path: '/v1/stream/stream-feed-credentials',
  },
  {
    method: 'get',
    regexPath: /^\/v1\/invite\/check\/[a-zA-Z0-9]+$/
  },
  {
    method: 'get',
    regexPath: /^\/v1\/api-docs(\/.*)?$/,
  }
]

const validateFirebaseIdToken = async (req: Request, res: Response, next: NextFunction) => {
  const path = req.path
  const method = req.method.toLowerCase()
  const isNonSecure = nonSecureAPIs.some(api => {
    let pathMatch = false
    if (api.path) pathMatch = api.path === path
    if (api.regexPath) pathMatch = api.regexPath.test(path)
    return pathMatch && api.method === method
  })
  if (isNonSecure) return next()

  console.log('Check if request is authorized with Firebase ID token')

  if (
    (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>',
      'or by passing a "__session" cookie.'
    )
    res.status(403).send('Unauthorized')
    return
  }

  let idToken
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    console.log('Found "Authorization" header')
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split('Bearer ')[1]
  } else if (req.cookies) {
    console.log('Found "__session" cookie')
    // Read the ID Token from cookie.
    idToken = req.cookies.__session
  } else {
    // No cookie
    res.status(403).send('Unauthorized')
    return
  }

  try {
    const decodedIdToken = await admin.auth().verifyIdToken(idToken)
    console.log('ID Token correctly decoded', decodedIdToken)
    req.user = decodedIdToken
    next()
    return
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error)
    res.status(403).send('Unauthorized')
    return
  }
}

export default validateFirebaseIdToken

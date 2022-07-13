/*
# from https://github.com/firebase/functions-samples/blob/master/authorized-https-endpoint/functions/index.js
*/

import { RequestHandler } from 'express'
import { initializeApp } from 'firebase-admin'
import { getAuth } from 'firebase-admin/auth'
import { ErrorCode, generateError } from '../utils/generators'
initializeApp()

const nonSecureAPIs = [
  {
    method: 'post',
    path: '/v1/getToken',
  },
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
    regexPath: /^\/v1\/invite\/check\/[a-zA-Z0-9]+$/,
  },
  {
    method: 'get',
    regexPath: /^\/v1\/api-docs(\/.*)?$/,
  },
  {
    method: 'post',
    path: '/v1/applicationLogs',
  },
]

const validateFirebaseIdToken: RequestHandler = async (req, res, next) => {
  const path = req.path
  const method = req.method.toLowerCase()
  const isNonSecure = nonSecureAPIs.some((api) => {
    let pathMatch = false
    if (api.path) pathMatch = api.path === path
    if (api.regexPath) pathMatch = api.regexPath.test(path)
    return pathMatch && api.method === method
  })
  if (isNonSecure) return next()

  const errorMessage = `No Firebase ID token was passed as a Bearer token in the Authorization header. Make sure you authorize your request by providing the HTTP header "Authorization: Bearer <Firebase ID Token>" or by passing a "__session" cookie.`

  if (
    (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    !(req.cookies && req.cookies.__session)
  ) {
    console.error(errorMessage)
    return next(
      generateError(ErrorCode.UnauthorizedError, {
        message: errorMessage,
      })
    )
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
    console.error(errorMessage)
    return next(generateError(ErrorCode.UnauthorizedError, { message: errorMessage }))
  }

  try {
    const decodedIdToken = await getAuth().verifyIdToken(idToken)
    console.log('ID Token correctly decoded', decodedIdToken)
    // @ts-ignore
    req.user = decodedIdToken
    return next()
  } catch (err) {
    const message = 'Error while verifying Firebase ID token'
    console.error(message, err)
    return next(generateError(ErrorCode.UnauthorizedError, { message, err }))
  }
}

export default validateFirebaseIdToken

import { RequestHandler } from 'express'
import { getApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { generateError, ErrorCode } from '../../../utils/generators'
// process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
// process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
// const firebaseApp = initializeApp({ projectId: 'lokal-1baac' })

const auth = getAuth(getApp())

/**
 * @openapi
 * /v1/getToken:
 *   post:
 *     tags:
 *       - authentication
 *     description: Use email and password to get token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 required: true
 *               password:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 accessToken:
 *                   type: string
 *                   example: tHis1sTh3t0K3ny0UcAnus3
 */
const login: RequestHandler = async (req, res) => {
  const data = req.body
  const { email, password } = data

  if (!email || !password) {
    throw generateError(ErrorCode.AuthenticationApiError, {
      message: 'Email and Password is required',
    })
  }

  const result = await signInWithEmailAndPassword(auth, email, password)

  const accessToken = await result.user.getIdToken()
  return res.json({ status: 'ok', accessToken })
}

export default login

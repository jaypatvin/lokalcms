import { Request, Response } from 'express'
import firebase from 'firebase'
import { config } from './firebase-config.json'
firebase.initializeApp(config)

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
const login = async (req: Request, res: Response) => {
  const data = req.body
  const { email, password } = data

  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and Password is required!' })
  }

  const result = await firebase.auth().signInWithEmailAndPassword(email, password)

  const accessToken = await result.user.getIdToken()
  return res.json({ status: 'ok', accessToken })
}

export default login

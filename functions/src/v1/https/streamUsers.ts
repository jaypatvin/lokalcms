import * as functions from 'firebase-functions';
import * as config from '../../getstream-config.json';
import wrapAsync from '../../utils/wrapAsync';
import { Router } from 'express';
const crypto = require('crypto');

const usersStorage = new Map();

const generateUserToken = () => crypto.randomBytes(32).toString('base64');

const streamUsersRouter = Router();

export const requireAuthHeader = (req, res, next) => {
  // 'Check if request is authorized with token from POST /authorize'
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
    res.statusMessage = "No Authorization header";
    res.status(401).send('Unauthorized');
    return;
  }

  const userToken = req.headers.authorization.split('Bearer ')[1];

  if (!usersStorage.has(userToken)) res.status(401).send('Unauthorized');

  req.user = { sender: usersStorage.get(userToken) };
  next();
};


export const getUsers = async (req, res) => {
  res.json({ users: Array.from(usersStorage.values()) });
};

export const postUsers = async (req, res) => {
  if (!req.body || !req.body.sender) {
    res.statusMessage = 'You should specify sender in body';
    res.status(400).end();
    return;
  }
  const token = generateUserToken();

  usersStorage.set(token, req.body.sender);

  res.json({ authToken: token });
};


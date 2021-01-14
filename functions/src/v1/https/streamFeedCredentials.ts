import * as functions from 'firebase-functions';
import { config } from '../../getstream-config.json';
import { connect } from 'getstream';


export const postStreamFeedCredentials =  async (req, res) => {
  try {
    const client = connect(config.key, config.secret, config.appId);

    await client.user(req.user.sender).getOrCreate({ name: req.user.sender });
    const token = client.createUserToken(req.user.sender);

    res.status(200).json({ 'token' :token, 'apiKey' : config.key, 'appId' : config.appId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

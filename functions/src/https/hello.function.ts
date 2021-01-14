import * as functions from 'firebase-functions';

export let httpsHello = functions.https.onRequest((req, res) => {
    const subject = req.query.subject || 'World'
    res.send(`Hello ${subject}!`)
});


import * as functions from 'firebase-functions';
import wrapAsync from '../../utils/wrapAsync';
import { Router } from 'express';

const helloRouter = Router();

helloRouter.get('/v1/hello', wrapAsync(async (req, res) => {
    const subject = req.query.subject || 'World';
    res.send(`Hello ${subject}!`);
}));

export default helloRouter;

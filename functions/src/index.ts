import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as bodyParser from "body-parser";
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

import helloRouter from './v1/https/hello.function';

const express = require('express');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', helloRouter);

require('./routes')(app);

exports.api = functions.https.onRequest(app);
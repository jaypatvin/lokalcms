import { ErrorRequestHandler } from 'express'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { IncomingWebhook } from '@slack/webhook'
import { ErrorCode } from '../utils/generators'

const webhook = new IncomingWebhook(get(functions.config(), 'slack_config.alerts_url'), {
  channel: get(functions.config(), 'slack_config.alerts_channel'),
  username: 'Lokal-API',
  icon_emoji: ':alert-danger:',
})

const errorAlert: ErrorRequestHandler = async (err, req, res, next) => {
  const requestorDocEmail = get(res.locals, 'userDoc.email', '--')
  console.log('sending alert to slack')
  try {
    const errorCode = get<ErrorCode>(err, 'code', ErrorCode.UnknownError)
    const errorValue =
      errorCode !== 'UnknownError'
        ? JSON.stringify(err)
        : JSON.stringify(err, Object.getOwnPropertyNames(err))
    await webhook.send({
      attachments: [
        {
          fallback: 'API error',
          pretext: 'API error',
          title: errorCode,
          color: 'danger',
          fields: [
            {
              title: 'Summary',
              value: errorValue,
            },
          ],
        },
        {
          color: 'danger',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Requestor:* ${requestorDocEmail}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Referer:* ${req.headers.referer ?? '--'}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Path:* ${req.path}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Method:* ${req.method}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Body:* ${JSON.stringify(req.body)}`,
              },
            },
          ],
        },
      ],
    })
  } catch (err) {
    console.error('Failed alerting to slack channel #alerts', err)
  }

  next(err)
}

export default errorAlert

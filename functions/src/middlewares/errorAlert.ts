import { ErrorRequestHandler } from 'express'
import * as functions from 'firebase-functions'
import { get } from 'lodash'
import { IncomingWebhook } from '@slack/webhook'

const webhook = new IncomingWebhook(
  get(
    functions.config(),
    'slack_config.alerts_url',
    'https://hooks.slack.com/services/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'
  ),
  {
    channel: get(functions.config(), 'slack_config.alerts_channel', '#alerts'),
    username: 'lokal-api',
    icon_emoji: ':thanos:',
  }
)

const errorAlert: ErrorRequestHandler = async (err, req, res, next) => {
  const requestorDocEmail = get(res.locals, 'userDoc.email', '--')
  console.log('sending alert to slack')
  const errorCode = get(err, 'code', 'UnknownError')
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
              text: `*Referer:* ${req.headers.referer}`,
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
  next(err)
}

export default errorAlert

import { NextFunction, Request, Response } from 'express'
import * as functions from 'firebase-functions'
import { IncomingWebhook } from '@slack/webhook'
import { get } from 'lodash'

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

const errorAlert = async (err: any, req: Request, res: Response, next: NextFunction) => {
  console.log('sending alert to slack')
  const errorCode = get(err, 'code', 'UnknownError')
  await webhook.send({
    attachments: [
      {
        fallback: `API error - ${errorCode}`,
        pretext: `API error - ${errorCode}`,
        color: 'danger',
        fields: [
          {
            title: 'Summary',
            value: JSON.stringify(err),
          },
        ],
      },
    ],
  })
  next(err)
}

export default errorAlert

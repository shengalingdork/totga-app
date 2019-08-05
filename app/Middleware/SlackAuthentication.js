'use strict'

const Env = use('Env')
const Crypto = require('crypto')
const QS = require('qs')

class SlackAuthentication {
  async handle ({ request }, next) {
    const headers = request.headers()
    const body = QS.stringify(request.all(), { format: 'RFC1738' })
    const timestamp = headers['x-slack-request-timestamp']
    const sig_full = headers['x-slack-signature']

    const now = Math.floor(new Date().getTime()/1000)
    if (Math.abs(now - timestamp) > 300) {
      return false
    }

    const sig_basestring = 'v0:' + timestamp + ':' + body
    const sig_full_computed = 'v0=' + Crypto
      .createHmac('sha256', Env.get('SLACK_SIGNING_SECRET'))
      .update(sig_basestring, 'utf8')
      .digest('hex')

    if (!Crypto.timingSafeEqual(
      Buffer.from(sig_full_computed, 'utf8'),
      Buffer.from(sig_full, 'utf-8')
    )) {
      return {
        response_type: 'ephemaral',
        text: 'Who are you?'
      }
    }

    await next()
  }
}

module.exports = SlackAuthentication

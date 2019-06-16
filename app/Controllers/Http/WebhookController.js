'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')
const UserApp = use('App/Models/UserApp')
const User = use('App/Models/User')
const Activity = use('App/Models/Activity')

const Env = use('Env')
const Crypto = require('crypto')
const QS = require('qs')

class WebhookController {
  async slack ({ request }) {
    if (!this.slackAuthenticate(request)) {
      return this.response('Who are you?')
    }

    const data = request.post()
    const body = data.text.split(' ')

    const userApp = await this.fetchUserApp(1, data.user_id)

    if (body[0] === 'register') {
      
      if (userApp) {
        return this.response('All good. You\'re already done.')
      }

      if (!body[1]) {
        return this.response(
          'Add a display name.',
          'Type `/totga register <display name>`'
        )
      }

      const result = await this.createUserApp(
        1,
        data.user_id,
        body[1],
        data.user_name
      )

      return result ? this.response('Registered!') : this.response('Can you try that again?')
    } 

    if (!userApp && body[0] !== 'register') {
      return this.response(
        'Let\'s register your account.',
        'Type `/totga register <display name>`'
      )
    }

    const activity = await this.fetchActivity(body[0])

    if (!activity) {
      return this.response(
        'That\'s invalid <@'+ data.user_id + '>',
        'Type `/totga <SL/VL/EL/WFH> <count>`'
        )
    }

    const count = body[1] ? body[1] : 1

    const result = await this.createUserAppActivity(
      userApp.id,
      activity.id,
      count,
      new Date()
    )

    return result ?
      this.response(
        'We got it, your update is now shown in the monitor.',
        'Stay safe bud!'
      ) :
      this.response(
        'Oh, something went wrong. Can you try again?',
        'Or if it really won\'t work, contact TOTGA team.'
      )
  }

  slackAuthenticate (data) {
    const headers = data.headers()
    const body = QS.stringify(data.all(), { format: 'RFC1738' })
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

    return Crypto.timingSafeEqual(
      Buffer.from(sig_full_computed, 'utf8'),
      Buffer.from(sig_full, 'utf-8')
    )
  }

  response (text, attachment) {
    let response = {}
    response.response_type = 'ephemeral'
    response.text = text
    if (attachment) {
      response.attachments = [{
        text: attachment
      }]
    }
    return response
  }

  async fetchUserApp (app_type, app_key) {
    const userApp = await UserApp.query().where({
      app_type: app_type,
      app_key: app_key
    }).first()
    return !userApp ? false : userApp.toJSON()
  }

  async fetchUser (name) {
    const user = await User.query().where('name', name).first()
    return !user ? false : user.toJSON()
  }

  async fetchActivity (code) {
    const activity = await Activity.query().where('code', code).first()
    return !activity ? false : activity.toJSON()
  }

  async createUserApp (app_type, app_key, display_name, user_name) {
    let user = await this.fetchUser(display_name)

    if (!user) {
      user = await this.createUser(display_name)
    }

    if (!user) {
      return false
    }

    try {
      const userApp = await UserApp.create({
        user_id: user.id,
        app_type: app_type,
        user_name: user_name,
        app_key: app_key
      })
      return userApp.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async createUser (name) {
    try {
      const user = await User.create({ name: name })
      return user.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  async createUserAppActivity (user_app_id, activity_id, count, start_at) {
    try {
      const userAppActivity = await UserAppActivity.create({
        user_app_id: user_app_id,
        activity_id: activity_id,
        count: count,
        start_at: this.getStartDate(start_at),
        end_at: this.getEndDate(start_at, count)
      })
      return userAppActivity.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  getStartDate (startAt) {
    let startAtCast = new Date(startAt)
    startAtCast.setHours(0,0,0,0)
    return startAtCast
  }

  getEndDate (startAt, count) {
    let endAt = new Date(startAt)
    endAt.setDate(parseInt(endAt.getDate()) + parseInt(count - 1))
    endAt.setHours(23,59,59,999)
    return endAt
  }
}

module.exports = WebhookController

'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')
const UserApp = use('App/Models/UserApp')
const User = use('App/Models/User')
const Activity = use('App/Models/Activity')
// const sampleData = { 
//   token: 'wEgVKcmlxUlXrhzYO7UOR2Xz',
//   team_id: 'T0CQRG2GJ',
//   team_domain: 'cambridge-education',
//   channel_id: 'D4D5CVCNQ',
//   channel_name: 'directmessage',
//   user_id: 'U4D6W530V',
//   user_name: 'shane_camus',
//   command: '/totga',
//   text: 'register Shane',
//   response_url: 'https://hooks.slack.com/commands/T0CQRG2GJ/668450256455/KwH6TMggjDtp0KGSvhKREJbz',
//   trigger_id: '668450256487.12841546562.7a54bc8688fc0ef2f6b8a4f265cb9b50'
// }


class WebhookController {
  async slack ({ request }) {
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
        'Kindly register your account first.',
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

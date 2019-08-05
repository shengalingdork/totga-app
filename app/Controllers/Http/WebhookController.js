'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')
const UserApp = use('App/Models/UserApp')
const User = use('App/Models/User')
const Activity = use('App/Models/Activity')

const SLACK_APP_TYPE_ID = 1
const SATURDAY_INDEX = 6
const SUNDAY_INDEX = 0

class WebhookController {
  async slack ({ request }) {

    const data = request.post()

    // initial checking of totga command
    if (!data.text) {
      return this.response(
        'That\'s invalid <@'+ data.user_id + '>',
        'Type `/totga <SL/VL/EL/WFH> <count>`'
        )
    }

    const body = data.text.split(' ')

    const userApp = await this.fetchUserApp(SLACK_APP_TYPE_ID, data.user_id)

    // check if for registration
    if (body[0] === 'register') {
      
      // check if user exists
      if (userApp) {
        return this.response('All good. You\'re already done.')
      }

      // check name parameter
      if (!body[1]) {
        return this.response(
          'Add a display name.',
          'Type `/totga register <display name> <email address>`'
        )
      }

      // check email address parameter
      if (!body[2]) {
        return this.response(
          'Add an email address.',
          'Type `/totga register <display name> <email address>`'
        )
      }

      // create user
      const result = await this.createUserApp(
        SLACK_APP_TYPE_ID,
        data.user_id,
        body[1],
        body[2],
        data.user_name
      )

      return result ? this.response('Registered!') : this.response('Can you try that again?')
    } 

    // check if user is not yet registered and not registering
    if (!userApp && body[0] !== 'register') {
      return this.response(
        'Let\'s register your account.',
        'Type `/totga register <display name> <email address>`'
      )
    }

    const activity = await this.fetchActivity(body[0])

    // check if totga activity is valid
    if (!activity) {
      return this.response(
        'That\'s invalid <@'+ data.user_id + '>',
        'Type `/totga <SL/VL/EL/WFH> <count>`'
        )
    }

    // set 1 as default activity count
    const count = body[1] ? body[1] : 1

    // check if it's not a weekend
    if (!this.isActivityDateValid()) {
      return this.response('Oh, but it\'s a weekend?')
    }

    // create user activity
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

  async createUserApp (app_type, app_key, display_name, email_address, user_name) {
    let user = await this.fetchUser(display_name)

    if (!user) {
      user = await this.createUser(display_name, email_address)
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

  async createUser (name, email_address) {
    try {
      const user = await User.create({ name: name, email_address: email_address })
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

  isActivityDateValid() {
    let today = new Date().getDay()
    return today !== SATURDAY_INDEX && today !== SUNDAY_INDEX
  }

  getStartDate (startAt) {
    let startAtCast = new Date(startAt)
    startAtCast.setHours(0,0,0,0)
    return startAtCast
  }

  getEndDate (startAt, count) {
    let endAt = new Date(startAt)
    let day = endAt.getDay()
    endAt.setDate(
      endAt.getDate() +
      (count - 1) +
      (day === SATURDAY_INDEX ? 2 : +!day) +
      (Math.floor((count - 1) / 5) * 2)
    )
    endAt.setHours(23,59,59,999)
    return endAt
  }
}

module.exports = WebhookController

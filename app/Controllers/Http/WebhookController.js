'use strict'

const SLACK_APP_TYPE_ID = 1
const SATURDAY_INDEX = 6
const SUNDAY_INDEX = 0

class WebhookController {
  static get inject () {
    return [
      'App/Repositories/Activity',
      'App/Repositories/User',
      'App/Repositories/UserApp',
      'App/Repositories/UserAppActivity'
    ]
  }

  constructor (Activity, User, UserApp, UserAppActivity) {
    this.Activity = Activity
    this.User = User
    this.UserApp = UserApp
    this.UserAppActivity = UserAppActivity
  }

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

    const userApp = await this.UserApp.show(SLACK_APP_TYPE_ID, data.user_id)

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
      const result = await this.UserApp.create(
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

    const activity = await this.Activity.show(body[0])

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
    const result = await this.UserAppActivity.create(
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

  isActivityDateValid() {
    let today = new Date().getDay()
    return today !== SATURDAY_INDEX && today !== SUNDAY_INDEX
  }

}

module.exports = WebhookController

'use strict'

const Logger = use('Logger')
const Event = use('Event')

const SLACK_APP_TYPE_ID = 1

class WebhookController {
  static get inject () {
    return [
      'App/Repositories/Activity',
      'App/Repositories/User',
      'App/Repositories/UserApp',
      'App/Repositories/UserAppActivity',
      'App/Repositories/CustomDate'
    ]
  }

  constructor (Activity, User, UserApp, UserAppActivity, CustomDate) {
    this.Activity = Activity
    this.User = User
    this.UserApp = UserApp
    this.UserAppActivity = UserAppActivity
    this.CustomDate = CustomDate
  }

  async slack ({ request }) {
    const data = request.post()

    // initial validation of totga command
    if (!data.text) {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${data.user_id}].`)
      return this.response(
        `That\'s invalid <@${data.user_id}>`,
        'Type `/totga <SL/VL/EL/WFH> <count>`'
        )
    }

    const body = data.text.split(' ')

    const userApp = await this.UserApp.show(SLACK_APP_TYPE_ID, data.user_id)

    // check if for registration
    if (body[0] === 'register') {
      // check if user exists
      if (userApp) { // U4D6W530V
        Logger
          .transport('info')
          .info(`Registers again [${data.user_id}].`)
        return this.response('All good. You\'re already done.')
      }

      // check name parameter
      if (!body[1]) {
        Logger
          .transport('info')
          .info(`Registers w/o name [${data.user_id}].`)
        return this.response(
          'Add a display name.',
          'Type `/totga register <display name> <email address>`'
        )
      }

      // check email address parameter
      if (!body[2]) {
        Logger
          .transport('info')
          .info(`Registers w/o email address [${data.user_id}].`)
        return this.response(
          'Add an email address.',
          'Type `/totga register <display name> <email address>`'
        )
      }

      if (body[2].search('@cambridge.org') < 0) {
        Logger
          .transport('info')
          .info(`Registers w/ invalid email address [${data.user_id}].`)
        return this.response(
          'Please enter a valid Cambridge email address.',
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

      if (!result) {
        Logger
          .transport('error')
          .error(`Failed registration [${data.user_id}].`)
        return this.response('Can you try that again?')
      }

      Logger
        .transport('info')
        .info(`Successfully registers [${data.user_id}].`)

      return this.response('Registered!')
    }

    // check if user is not yet registered and not registering
    if (!userApp && body[0] !== 'register') {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${data.user_id}].`)
      return this.response(
        'Let\'s register your account.',
        'Type `/totga register <display name> <email address>`'
      )
    }

    const activity = await this.Activity.show(body[0])

    // check if totga activity is valid
    if (!activity) {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${data.user_id}].`)
      return this.response(
        `That\'s invalid <@${data.user_id}>`,
        'Type `/totga <SL/VL/EL/WFH> <count>`'
        )
    }

    if (body[1] && parseFloat(body[1]) < 1) {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${data.user_id}].`)
      return this.response(
        `That\'s invalid <@${data.user_id}>. Count should always be 1 or more.`,
        'Type `/totga <SL/VL/EL/WFH> <count>.`'
        )
    }

    // set 1 as default activity count
    const count = body[1] ? Math.round(parseFloat(body[1])) : 1

    const today = this.CustomDate.getDatetimeNow()

    // check if it's not a weekend
    if (!this.CustomDate.isActivityDateValid(today.date)) {
      Logger
        .transport('info')
        .info(`Triggered command on a weekend [${data.user_id}].`)
      return this.response('Oh, but it\'s a weekend?')
    }

    // create user activity
    const result = await this.UserAppActivity.create(
      userApp.id,
      activity.id,
      count,
      this.CustomDate.getStartDate(today.date),
      this.CustomDate.getEndDate(today.date, count)
    )

    if (!result) {
      Logger
        .transport('error')
        .error(`Failed activity update [${data.user_id}].`)
      return this.response(
        'Oh, something went wrong. Can you try again?',
        'Or if it really won\'t work, contact TOTGA team.'
      )
    }

    // update monitor display
    this.updateTracker(result)

    Logger
      .transport('info')
      .info(`Successfully updates activity [${data.user_id}].`)
    return this.response(
      'We got it, your update is now shown in the monitor.',
      'Stay safe bud!'
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

  async updateTracker (activityLog) {
    const data = await this.UserAppActivity.fetch([activityLog.id])
    Event.emit('new::activity', data)
  }
}

module.exports = WebhookController

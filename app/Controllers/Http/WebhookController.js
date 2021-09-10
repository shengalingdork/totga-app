'use strict'

const Logger = use('Logger')

const SLACK_APP_TYPE_ID = 1

class WebhookController {
  static get inject() {
    return [
      'App/Repositories/Webhook',
      'App/Repositories/Activity',
      'App/Repositories/User',
      'App/Repositories/UserApp'
    ]
  }

  constructor(Webhook, Activity, User, UserApp, CustomDate) {
    this.Webhook = Webhook
    this.Activity = Activity
    this.User = User
    this.UserApp = UserApp
    this.CustomDate = CustomDate
  }

  async slack({ request }) {
    const data = request.post()
    const { user_id: userAppKey, user_name: username, text } = data

    // initial validation of totga command
    if (!text) {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${userAppKey}].`)
      return this.Webhook.response(
        `Not sure what to do?`,
        'Type `/totga help` for more options'
      )
    }

    const body = text.split(' ')

    // help command
    if (body[0] === 'help') {
      return this.Webhook.help()
    }

    // reminder command
    if (body[0] === 'remind') {
      return this.Webhook.response(
        'Somebody filed a leave? Here\'s a gentle nudge to file it on TOTGA to inform your colleagues.',
        'For more details, check `/totga help`.',
        true
      )
    }

    const userApp = await this.UserApp.show(SLACK_APP_TYPE_ID, userAppKey)

    // check if user is not yet registered and not registering
    if (!userApp && body[0] !== 'register') {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${userAppKey}].`)
      return this.Webhook.response(
        'Let\'s register your account first.',
        'Type `/totga register <display name> <email address>`'
      )
    }

    // check if for registration
    if (body[0] === 'register') {
      return this.Webhook.register(userAppKey, username, userApp, body)
    }

    // check if for deletion
    if (body[0] === 'delete') {
      return this.Webhook.delete(userApp)
    }

    const user = await this.User.show(userApp.user_id)

    // check if line manager
    if (body[0] === 'file') {
      const { is_manager } = user
      if (!is_manager) {
        return this.Webhook.response(
          'Sorry, this command is for line managers only!',
          'Type `/totga <SL/VL/EL/WFH> <count>` or `/totga help` for more options'
        )
      }

      return this.Webhook.file(userAppKey, body)
    }

    const activity = await this.Activity.show(body[0])

    // check if totga activity is valid
    if (!activity) {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${userAppKey}].`)
      return this.Webhook.response(
        `That\'s invalid <@${userAppKey}>`,
        'Type `/totga <SL/VL/EL/WFH> <count>` or `/totga help` for more options'
      )
    }

    if (body[1] && parseFloat(body[1]) < 1) {
      Logger
        .transport('info')
        .info(`Triggered invalid /totga command [${userAppKey}].`)
      return this.Webhook.response(
        `That\'s invalid <@${userAppKey}>. Count should always be 1 or more.`,
        'Type `/totga <SL/VL/EL/WFH> <count>.`'
      )
    }

    // submit activity
    return this.Webhook.submit(user, userApp, activity, body[1])
  }
}

module.exports = WebhookController

'use strict'

const Logger = use('Logger')
const Event = use('Event')
const Env = use('Env')
const Fetch = use('Fetch')

const SLACK_APP_TYPE_ID = 1

class WebhookRepository {
  static get inject() {
    return [
      'App/Repositories/User',
      'App/Repositories/UserApp',
      'App/Repositories/Activity',
      'App/Repositories/UserAppActivity',
      'App/Repositories/CustomDate'
    ]
  }

  constructor(
    UserRepository,
    UserAppRepository,
    ActivityRepository,
    UserAppActivityRepository,
    CustomDateRepository
  ) {
    this.UserRepo = UserRepository
    this.UserAppRepo = UserAppRepository
    this.ActivityRepo = ActivityRepository
    this.UserAppActivityRepo = UserAppActivityRepository
    this.CustomDateRepo = CustomDateRepository
  }

  help() {
    return {
      text: 'TOTGA Commands and Guidelines',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'The Out-of-office Tracker Generator App :calendar:',
            emoji: true
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*TOTGA Team*: :lorica: :meg: :shane1:\n\n*List of commands:*'
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: 'Same Day Update (SDU)\n`/totga <SL/VL/EL/WFH> <count>`'
            },
            {
              type: 'mrkdwn',
              text: '>_File your activity for the current day and onwards. Add -E (early) or -L (late) to the activity for a half-day leave._'
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: 'Registration\n`/totga register <display name> <email address>`'
            },
            {
              type: 'mrkdwn',
              text: '>_Register to link your Cambridge account to your Slack ID._'
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: 'Line Manager SDU\n`/totga file <email address> <SL/VL/EL/WFH> <count>`'
            },
            {
              type: 'mrkdwn',
              text: '>_File an activity for your team member. This command is for line managers only._'
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: 'Reminder\n`/totga remind`'
            },
            {
              type: 'mrkdwn',
              text: '>_Remind a fellow colleague to use TOTGA._'
            }
          ]
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: 'Help\n`/totga help`'
            },
            {
              type: 'mrkdwn',
              text: '>_Show commands and general guidelines for using TOTGA._'
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*General guidelines:*'
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'TOTGA Page: https://totga.cambridgedev.org/'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Has a planned leave? Use the `Technology Education` Calendar (technologyeducation@cambridge.org) and file a meeting with the ff. details: ```Subject: <Name> <SL/VL/EL/WFH>\nAttendee: <email address>\nDate: <planned date(s) of leave>\nTime: All day```\nYour leave should be displayed on the day itself at 9AM.'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Decided to leave today (and onwards)? Use Same Day Update.'
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'How-To Video: https://bit.ly/3si4FAe'
          }
        },
        {
          type: 'divider'
        }
      ]
    }
  }

  /**
   * REGISTER A USER
   * @param {object} userAppKey 
   * @param {string} username 
   * @param {object} userApp 
   * @param {array} body 
   * @returns Slack response object
   */
  async register(userAppKey, username, userApp, body) {
    // check if user exists
    if (userApp) {
      Logger
        .transport('info')
        .info(`Registers again [${userAppKey}].`)
      return this.response('All good. You\'re already done.')
    }

    // check name parameter
    if (!body[1]) {
      Logger
        .transport('info')
        .info(`Registers w/o name [${userAppKey}].`)
      return this.response(
        'Add a display name.',
        'Type `/totga register <display name> <email address>`'
      )
    }

    // check email address parameter
    if (!body[2]) {
      Logger
        .transport('info')
        .info(`Registers w/o email address [${userAppKey}].`)
      return this.response(
        'Add an email address.',
        'Type `/totga register <display name> <email address>`'
      )
    }

    if (body[2].search('@cambridge.org') < 0) {
      Logger
        .transport('info')
        .info(`Registers w/ invalid email address [${userAppKey}].`)
      return this.response(
        'Please enter a valid Cambridge email address.',
        'Type `/totga register <display name> <email address>`'
      )
    }

    // create user
    const result = await this.UserAppRepo.create(
      SLACK_APP_TYPE_ID,
      userAppKey,
      body[1],
      body[2],
      username
    )

    if (!result) {
      Logger
        .transport('error')
        .error(`Failed registration [${userAppKey}].`)
      return this.response('Can you try that again?')
    }

    Logger
      .transport('info')
      .info(`Successfully registers [${userAppKey}].`)

    return this.response('Registered!', false, true)
  }

  /**
   * LINE MANAGER FILE
   * @param {string} userAppKey 
   * @param {array} body 
   * @returns Slack response object
   */
  async file(userAppKey, body) {
    const managerAppKey = userAppKey
    const user = await this.UserRepo.getByEmailAddress(body[1])

    if (!user) {
      Logger
        .transport('info')
        .info(`Manager ${managerAppKey} filed w/ invalid email address [${body[1]}].`)
      return this.response(
        'Please enter a registered Cambridge email address.',
        'Type `/totga file <email address> <SL/VL/EL/WFH> <count>`'
      )
    }

    const userApp = await this.UserAppRepo.getSlackUserByUserId(
      SLACK_APP_TYPE_ID,
      user.id
    )

    if (!userApp) {
      Logger
        .transport('info')
        .info(`Manager ${managerAppKey} filed w/ unregistered email address [${body[1]}].`)
      return this.response(
        'Please enter a registered Cambridge email address.',
        'Type `/totga file <email address> <SL/VL/EL/WFH> <count>`'
      )
    }

    const activity = await this.ActivityRepo.show(body[2])

    if (!activity) {
      Logger
        .transport('info')
        .info(`Manager ${managerAppKey} filed w/ invalid activity [${body[2]}].`)
      return this.response(
        'Please enter a valid activity.',
        'Type `/totga file <email address> <SL/VL/EL/WFH> <count>`'
      )
    }


    return this.submit(user, userApp, activity, body[3])
  }

  /**
   * SUBMIT ACTIVITY
   * @param {object} user 
   * @param {object} userApp 
   * @param {object} activity 
   * @param {string} count 
   * @returns Slack response object
   */
  async submit(user, userApp, activity, count = null) {
    const { id: activityId, code: activityCode } = activity
    const { id: userAppId, app_key: userAppKey } = userApp
    const { name: username } = user

    // set 1 as default activity count
    count = count ? Math.round(parseFloat(count)) : 1

    // check if it's not a weekend
    const today = this.CustomDateRepo.getDatetimeNow()
    if (!this.CustomDateRepo.isActivityDateValid(today.date)) {
      Logger
        .transport('info')
        .info(`Triggered command on a weekend [${userAppKey}].`)
      return this.response('Oh, but it\'s a weekend?')
    }

    // create user activity
    const result = await this.UserAppActivityRepo.create(
      userAppId,
      activityId,
      count,
      this.CustomDateRepo.getStartDate(today.date),
      this.CustomDateRepo.getEndDate(today.date, count)
    )

    if (!result) {
      Logger
        .transport('error')
        .error(`Failed activity update [${userAppKey}].`)
      return this.response(
        'Oh, something went wrong. Can you try again?',
        'Or if it really won\'t work, contact TOTGA team.'
      )
    }

    // update monitor display
    await this.updateTracker(result)
    // update team channel
    await this.updateTeamChannel(username, activityCode)

    Logger
      .transport('info')
      .info(`Successfully updates activity [${userAppKey}].`)
    return this.response(
      'We got it, your update is now shown in the monitor.',
      'Stay safe bud!',
      true
    )
  }

  async delete(userApp) {
    const { id: userAppId, app_key: userAppKey } = userApp
    const today = this.CustomDateRepo.getDatetimeNow()
    const startDate = this.CustomDateRepo.getStartDate(today.date)
    const endDate = this.CustomDateRepo.getEndDate(today.date)
    const userAppActivity = await this.UserAppActivityRepo.getByUserId(
      userAppId,
      { startDate, endDate }
    )

    if (!userAppActivity) {
      Logger
        .transport('info')
        .info(`No activity for deletion [${userAppKey}].`)
      return this.response(
        'Nothing to delete today.',
        'It is not possible to delete an activity on the previous days.'
      )
    }

    const { id: userAppActivityId } = userAppActivity
    const result = await this.UserAppActivityRepo.softDelete(userAppActivityId)

    if (!result) {
      Logger
        .transport('error')
        .error(`Failed activity deletion [${userAppKey}].`)
      return this.response(
        'Oh, something went wrong. Can you try again?',
        'Or if it really won\'t work, contact TOTGA team.'
      )
    }

    Logger
      .transport('info')
      .info(`Successfully deleted previous activity [${userAppKey}].`)
    return this.response(
      'We got it, your most recent activity is now deleted.',
      'Stay safe bud!',
      true
    )
  }

  response(text, attachment = false, isPublic = false) {
    let response = {}
    response.response_type = isPublic ? 'in_channel' : 'ephemeral'
    response.text = text
    if (attachment) {
      response.attachments = [{
        text: attachment
      }]
    }
    return response
  }

  async updateTracker(activityLog) {
    const data = await this.UserAppActivityRepo.fetch([activityLog.id])
    Event.emit('new::activity', data)
  }

  async updateTeamChannel(name, activity) {
    const SLACK_POST_MESSAGE_URL = 'https://slack.com/api/chat.postMessage'
    const header = { Authorization: `Bearer ${Env.get('SLACK_TOKEN')}` }
    const params = {
      channel: Env.get('SLACK_TEAM_CHANNEL'),
      text: `${name} ${activity}`
    }
    await Fetch.call('post', SLACK_POST_MESSAGE_URL, header, params)
  }
}

module.exports = WebhookRepository
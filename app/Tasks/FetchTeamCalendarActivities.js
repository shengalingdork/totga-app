'use strict'

const Task = use('Task')
const Env = use('Env')
const Logger = use('Logger')
const axios = require('axios')
const { URLSearchParams } = require('url')

const ActivityRepo = use('App/Repositories/Activity')
const UserAppRepo = use('App/Repositories/UserApp')
const UserAppActivityRepo = use('App/Repositories/UserAppActivity')

const MS_APP_TYPE_ID = 3

class FetchTeamCalendarActivities extends Task {
  static get schedule () {
    return '0 1 * * *'
  }

  async handle () {
    const UserApp = new UserAppRepo
    const Activity = new ActivityRepo
    const UserAppActivity = new UserAppActivityRepo

    const today = new Date()
    const startDay = today.toISOString().slice(0,10)
    const endDay = new Date(today.getTime()+1000*60*60*24)
      .toISOString()
      .slice(0,10)

    // fetch all user activities for the day
    const userActivities = await this.getUserActivities(
      `${startDay}T17:00:00Z`,
      `${endDay}T16:00:00Z`
    )

    // check if zero activities
    if (!userActivities.length) {
      Logger.transport('info').info('No activity entries today.')
      return
    }

    let user, emailAddress, subject, userApp, activity, userAppActivity

    // loop through each activity
    for (let userActivity of userActivities) {

      // check attendee
      if (userActivity.attendees.length < 1) {
        Logger
          .transport('info')
          .notice(`Incorrect format, no attendee [${userActivity.subject}].`)
        continue
      }

      subject = userActivity.subject.split(' ')

      // check activity parameter
      if (subject.length < 2) {
        Logger
          .transport('info')
          .notice(`Incorrect format, missing activity [${userActivity.subject}].`)
        continue
      }

      activity = await Activity.show(subject[1])

      // check if activity is valid
      if (!activity) {
        Logger
          .transport('info')
          .notice(`Incorrect format, invalid activity [${userActivity.subject}].`)
        continue
      }

      emailAddress = userActivity.attendees[0].emailAddress.address

      // fetch user details from microsoft
      user = await this.getUserByEmailAddress(emailAddress)
      
      // check if user is valid
      if (!user.success) {
        Logger
          .transport('info')
          .notice(`Invalid attendee [${emailAddress}].`)
        continue
      }

      // check if user is registered
      userApp = await UserApp.show(MS_APP_TYPE_ID, user.data.id)

      // create user app
      if (!userApp) {
        userApp = await UserApp.create(
          MS_APP_TYPE_ID,
          user.data.id,
          subject[0],
          user.data.mail,
          user.data.givenName,
        )
      }

      if (!userApp) {
        Logger.transport('error').error(`Registration failed [${emailAddress}]`)
        continue
      }

      // create user app activity
      userAppActivity = await UserAppActivity.create(
        userApp.id,
        activity.id,
        1,
        new Date()
      )

      if (!userAppActivity) {
        Logger
          .transport('error')
          .error(`Activity saving failed [${userActivity.subject}]`)
        continue
      }

      Logger.transport('info').info(`Successful save [${userActivity.subject}]`)
    }
  }

  async fetch (method, url, headers=null, data=null) {
    var params = {
      method: method,
      url: url
    }

    if (headers) {
      params['headers'] = headers
    }

    if (data) {
      params['data'] = new URLSearchParams(data).toString()
    }

    try {
      const result = await axios(params)
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        data: error.response
      }
    }
  }

  async getAccessToken () {
    const url = Env.get('MS_GRAPH_TOKEN_ENDPOINT')
    const header = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const data = {
      grant_type: 'refresh_token',
      client_id: Env.get('MS_GRAPH_CLIENT_ID'),
      refresh_token: Env.get('MS_GRAPH_REFRESH_TOKEN'),
      redirect_uri: Env.get('NGROK_URI'),
      client_secret: Env.get('MS_GRAPH_CLIENT_SECRET')
    }

    const response = await this.fetch('post', url, header, data)
  
    return response.success ? response.data.access_token : response
  }

  async getUserActivities (startDatetime, endDatetime) {
    const queryParams = new URLSearchParams({
      startdatetime: startDatetime,
      enddatetime: endDatetime,
      select: 'subject,attendees'
    }).toString()

    const url = Env.get('MS_GRAPH_API_URL') + 'users/' +
    Env.get('TEAM_CALENDAR') + '/calendarview?' + queryParams

    const header = { 'Authorization': 'Bearer ' + await this.getAccessToken() }
  
    const response = await this.fetch('get', url, header)

    return response.success ? response.data.value : response
  }

  async getUserByEmailAddress (emailAddress) {
    const queryParams = new URLSearchParams({
      select: 'id,givenName,mail'
    }).toString()

    const url = Env.get('MS_GRAPH_API_URL') + 'users/' + emailAddress +
    '?$' + queryParams

    const header = { 'Authorization': 'Bearer ' + await this.getAccessToken() }

    const response = await this.fetch('get', url, header)

    return response
  }
}

module.exports = FetchTeamCalendarActivities

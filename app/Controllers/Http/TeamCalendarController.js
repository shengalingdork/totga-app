'use strict'

const Env = use('Env')
const axios = require('axios')
const { URLSearchParams } = require('url')

const MS_APP_TYPE_ID = 3

class TeamCalendarController {
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

  async storeUserActivities () {
    const userActivities = await this.getUserActivities(
      '2019-07-18T16:00:00Z',
      '2019-07-19T16:00:00Z'
    )

    if (!userActivities.length) {
      console.log('walang entries today')
      return
    }

    let response, emailAddress, subject, userApp, activity, userAppActivity

    userActivities.forEach( async (userActivity) => {

      if (userActivity.attendees.length < 1) {
        console.log('hindi tama format')
        return
      }

      emailAddress = userActivity.attendees[0].emailAddress.address
      response = await this.getUserByEmailAddress(emailAddress)

      if (!response.success) {
        console.log('hindi nageexist user sa microsoft')
        return
      }

      userApp = await this.UserApp.show(MS_APP_TYPE_ID, response.data.id)

      if (!userApp) {
        userApp = await this.UserApp.create(
          MS_APP_TYPE_ID,
          response.data.id,
          response.data.givenName,
          response.data.mail,
          ''
        )
      }

      if (!userApp) {
        console.log('fail register')
        return
      }

      subject = userActivity.subject.split(' ')
      activity = await this.Activity.show(subject[1])

      if (!activity) {
        console.log('invalid activity')
        return
      }

      userAppActivity = await this.UserAppActivity.create(
        userApp.id,
        activity.id,
        1,
        new Date()
      )

      if (!userAppActivity) {
        console.log('fail save activity')
        return
      }

      console.log('successful')
      return
    })

    return
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
      // console.log(result.data)
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      // console.log('Error: ', error.response)
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

module.exports = TeamCalendarController

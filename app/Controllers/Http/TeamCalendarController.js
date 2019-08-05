'use strict'

const Env = use('Env')
const axios = require('axios')
const { URLSearchParams } = require('url')

class TeamCalendarController {
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
      console.log(result.data)
      return result.data
    } catch (error) {
      console.log('Error: ', error)
      return error
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

    return response.access_token
  }

  async getActivities () {
    const queryParams = new URLSearchParams({
      startdatetime: '2019-07-18T16:00:00Z',
      enddatetime: '2019-07-19T16:00:00Z',
      select: 'subject,attendees'
    }).toString()

    const url = Env.get('MS_GRAPH_API_URL') + 'users/' +
    Env.get('TEAM_CALENDAR') + '/calendarview?' + queryParams

    const header = { 'Authorization': 'Bearer ' + await this.getAccessToken() }
  
    const response = await this.fetch('get', url, header)

    return response.value
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

'use strict'

const axios = require('axios')
const { URLSearchParams } = require('url')

class Fetch {
  async call(method, url, headers = null, data = null) {
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
}

module.exports = Fetch
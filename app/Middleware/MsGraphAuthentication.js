'use strict'

const Env = use('Env')
const Request = use('Request')

class MsGraphAuthentication {
  async handle ({ request }, next) {
    await next()
  }
}

module.exports = MsGraphAuthentication

'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')
const message = 'Activity log cannot be found'
const status = 404
const code = 'E_NOT_FOUND'

class ActivityLogNotFoundException extends LogicalException {
  constructor () {
    super (message, status, code)
  }
}

module.exports = ActivityLogNotFoundException

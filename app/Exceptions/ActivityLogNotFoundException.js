'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class ActivityLogNotFoundException extends LogicalException {
  handle (error, { response }) {
    return response
      .status(404)
      .send({
        status: 404,
        message: `${error}: Activity log cannot be found`
      })
  }
}

module.exports = ActivityLogNotFoundException

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserAppsSchema extends Schema {
  up () {
    this.table('user_apps', (table) => {
      table.dropUnique(['user_name'])
    })
  }

  down () {
    this.table('user_apps', (table) => {
      table.string('user_name', 64).unique().alter()
    })
  }
}

module.exports = UserAppsSchema

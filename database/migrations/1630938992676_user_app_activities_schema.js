'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserAppActivitiesSchema extends Schema {
  up () {
    this.table('user_app_activities', (table) => {
      table.boolean('is_deleted').after('count').defaultTo(0)
    })
  }

  down () {
    this.table('user_app_activities', (table) => {
      table.dropColumn('is_deleted')
    })
  }
}

module.exports = UserAppActivitiesSchema

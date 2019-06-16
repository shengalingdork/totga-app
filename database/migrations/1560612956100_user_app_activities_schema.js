'use strict'

const Schema = use('Schema')

class UserAppActivitiesSchema extends Schema {
  up () {
    this.create('user_app_activities', (table) => {
      table.increments()
      table.integer('user_app_id').unsigned().references('id').inTable('user_apps')
      table.integer('activity_id').unsigned().references('id').inTable('activities')
      table.datetime('start_at')
      table.datetime('end_at')
      table.integer('count').unsigned()
      table.timestamps()
    })
  }

  down () {
    this.drop('user_app_activities')
  }
}

module.exports = UserAppActivitiesSchema

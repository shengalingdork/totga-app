'use strict'

const Schema = use('Schema')

class UserAppActivitiesSchema extends Schema {
  up () {
    this.create('user_app_activities', (table) => {
      table.increments()
      table.integer('user_app_id').unsigned().references('id').inTable('user_apps').notNullable()
      table.integer('activity_id').unsigned().references('id').inTable('activities').notNullable()
      table.datetime('start_at').notNullable()
      table.datetime('end_at').notNullable()
      table.integer('count').unsigned().notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('user_app_activities')
  }
}

module.exports = UserAppActivitiesSchema

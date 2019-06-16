'use strict'

const Schema = use('Schema')

class UserAppsSchema extends Schema {
  up () {
    this.create('user_apps', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users').notNullable()
      table.integer('app_type').unsigned().references('id').inTable('apps').notNullable()
      table.string('user_name', 64).notNullable().unique()
      table.string('app_key', 128).notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('user_apps')
  }
}

module.exports = UserAppsSchema

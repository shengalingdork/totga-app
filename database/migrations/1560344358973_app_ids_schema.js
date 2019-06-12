'use strict'

const Schema = use('Schema')

class AppIdsSchema extends Schema {
  up () {
    this.create('app_ids', (table) => {
      table.increments()
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('app_type').unsigned().references('id').inTable('apps')
      table.string('app_key', 128).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('app_ids')
  }
}

module.exports = AppIdsSchema

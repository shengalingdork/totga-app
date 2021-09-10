'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.boolean('is_manager').after('email_address').defaultTo(0)
    })
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('is_manager')
    })
  }
}

module.exports = UsersSchema

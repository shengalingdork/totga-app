'use strict'

const Schema = use('Schema')

class AppsSchema extends Schema {
  up () {
    this.create('apps', (table) => {
      table.increments()
      table.string('name', 64).notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('apps')
  }
}

module.exports = AppsSchema

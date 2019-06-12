'use strict'

const Schema = use('Schema')

class ActivitiesSchema extends Schema {
  up () {
    this.create('activities', (table) => {
      table.increments()
      table.string('name', 64).notNullable().unique()
      table.string('code', 10).notNullable().unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('activities')
  }
}

module.exports = ActivitiesSchema

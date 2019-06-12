'use strict'

const Schema = use('Schema')

class AppActivitiesSchema extends Schema {
  up () {
    this.create('app_activities', (table) => {
      table.increments()
      table.integer('app_id').unsigned().references('id').inTable('app_ids')
      table.integer('activity_id').unsigned().references('id').inTable('activities')
      table.date('start_at')
      table.date('end_at')
      table.integer('count').unsigned()
      table.timestamps()
    })
  }

  down () {
    this.drop('app_activities')
  }
}

module.exports = AppActivitiesSchema

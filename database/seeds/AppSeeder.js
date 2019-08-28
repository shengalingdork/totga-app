'use strict'

/*
|--------------------------------------------------------------------------
| AppSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database')

class AppSeeder {
  async run () {
    await Database
        .insert([
          {
            name: 'Slack',
            created_at: Database.fn.now(),
            updated_at: Database.fn.now()
          },
          {
            name: 'Messenger',
            created_at: Database.fn.now(),
            updated_at: Database.fn.now()
          },
          {
            name: 'Calendar',
            created_at: Database.fn.now(),
            updated_at: Database.fn.now()
          }
        ])
        .into('apps')
  }
}

module.exports = AppSeeder

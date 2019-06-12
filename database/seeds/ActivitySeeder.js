'use strict'

/*
|--------------------------------------------------------------------------
| ActivitySeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Database = use('Database')

class ActivitySeeder {
  async run () {
    const firstId = await Database
    .insert([
      {
        name: 'Work From Home',
        code: 'WFH',
        created_at: Database.fn.now(),
        updated_at: Database.fn.now()
      },
      {
        name: 'Sick Leave',
        code: 'SL',
        created_at: Database.fn.now(),
        updated_at: Database.fn.now()
      },
      {
        name: 'Vacation Leave',
        code: 'VL',
        created_at: Database.fn.now(),
        updated_at: Database.fn.now()
      },
      {
        name: 'Emergency Leave',
        code: 'EL',
        created_at: Database.fn.now(),
        updated_at: Database.fn.now()
      }
    ])
    .into('activities')
  }
}

module.exports = ActivitySeeder

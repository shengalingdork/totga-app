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
    await Database
      .insert([
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
        },
        {
          name: 'Work From Home',
          code: 'WFH',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Sick Leave - Early',
          code: 'SL-E',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Sick Leave - Late',
          code: 'SL-L',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Vacation Leave - Early',
          code: 'VL-E',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Vacation Leave - Late',
          code: 'VL-L',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Emergency Leave - Early',
          code: 'EL-E',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Emergency Leave - Late',
          code: 'EL-L',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Work From Home - Early',
          code: 'WFH-E',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        },
        {
          name: 'Work From Home - Late',
          code: 'WFH-L',
          created_at: Database.fn.now(),
          updated_at: Database.fn.now()
        }
      ])
      .into('activities')
  }
}

module.exports = ActivitySeeder

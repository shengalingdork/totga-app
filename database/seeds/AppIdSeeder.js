'use strict'

/*
|--------------------------------------------------------------------------
| AppIdSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')

class AppIdSeeder {
  async run () {
    await Factory.model('App/Models/AppId').createMany(8)
  }
}

module.exports = AppIdSeeder

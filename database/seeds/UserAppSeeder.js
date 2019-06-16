'use strict'

/*
|--------------------------------------------------------------------------
| UserAppSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')

class UserAppSeeder {
  async run () {
    await Factory.model('App/Models/UserApp').createMany(8)
  }
}

module.exports = UserAppSeeder

'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker) => {
  return {
    name: faker.name()
  }
})

Factory.blueprint('App/Models/UserApp', (faker) => {
  return {
    user_id: async () => {
      return (await Factory.model('App/Models/User').create()).id
    },
    app_type: faker.integer({ min:1, max:3 }),
    app_key: faker.fbid()
  }
})

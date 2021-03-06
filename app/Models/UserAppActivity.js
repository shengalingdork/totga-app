'use strict'

const Model = use('Model')

class UserAppActivity extends Model {
  static get dates () {
    return super.dates.concat(['start_at', 'end_at'])
  }

  userApp () {
    return this.belongsTo('App/Models/UserApp')
  }

  activity () {
    return this.belongsTo('App/Models/Activity')
  }
}

module.exports = UserAppActivity

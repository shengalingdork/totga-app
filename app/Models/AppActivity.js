'use strict'

const Model = use('Model')

class AppActivity extends Model {
  static get dates () {
    return super.dates.concat(['start_at', 'end_at'])
  }

  appId () {
    return this.hasOne('App/Models/AppId')
  }

  activity () {
    return this.hasOne('App/Models/Activity')
  }
}

module.exports = AppActivity

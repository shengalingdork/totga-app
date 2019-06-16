'use strict'

const Model = use('Model')

class UserApp extends Model {
  user () {
    return this.belongsTo('App/Models/User')
  }

  app () {
    return this.belongsTo('App/Models/App', 'app_type')
  }

  userAppActivities () {
    return this.hasMany('App/Models/UserAppActivity')
  }
}

module.exports = UserApp

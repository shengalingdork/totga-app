'use strict'

const Model = use('Model')

class AppId extends Model {
  user () {
    return this.belongsTo('App/Models/User')
  }

  app () {
    return this.hasOne('App/Models/App')
  }

  appActivities () {
    return this.hasMany('App/Models/AppActivity')
  }
}

module.exports = AppId

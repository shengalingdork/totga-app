'use strict'

const Model = use('Model')

class Activity extends Model {
  userAppActivities () {
    return this.hasMany('App/Models/UserAppActivity')
  }
}

module.exports = Activity

'use strict'

const Model = use('Model')

class Activity extends Model {
  static get visible () {
    return ['name','code']
  }

  userAppActivities () {
    return this.hasMany('App/Models/UserAppActivity')
  }
}

module.exports = Activity

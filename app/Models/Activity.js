'use strict'

const Model = use('Model')

class Activity extends Model {
  appActivities () {
    return this.hasMany('App/Models/AppActivity')
  }
}

module.exports = Activity

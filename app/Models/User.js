'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
  userApps () {
    return this.hasMany('App/Models/UserApp')
  }
}

module.exports = User

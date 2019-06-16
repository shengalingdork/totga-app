'use strict'

const Model = use('Model')

class App extends Model {
  userApps () {
    return this.hasMany('App/Models/UserApp')
  }
}

module.exports = App

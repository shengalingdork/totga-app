'use strict'

const Model = use('Model')

class App extends Model {
  appIds () {
    return this.hasMany('App/Models/AppId')
  }
}

module.exports = App

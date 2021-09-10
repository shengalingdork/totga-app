'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const FetchService = require('./index')

class FetchProvider extends ServiceProvider {
  register () {
    this.app.bind('Fetch', () => {
      return new FetchService
    })
  }
}

module.exports = FetchProvider
'use strict'

const { ServiceProvider } = require('@adonisjs/fold')
const DefaultFileDriver = require('@adonisjs/framework/src/Logger/Drivers/File')
const _ = use('lodash')

class CustomFileLoggerProvider extends ServiceProvider {
  /**
   * Register namespaces to the IoC container
   *
   * @method register
   *
   * @return {void}
   */
  register () {
    this.app.extend('Adonis/Src/Logger', 'custom', () => {
      class CustomFileLogger extends DefaultFileDriver {
        log(level, msg, ...meta) {
            const levelName = _.findKey(this.levels, (num) => {
                return num === level
            })
            this.logger.log(
              levelName,
              `${new Date().toLocaleString()} :: ${msg}`,
              ...meta
            )
        }
      }

      return new CustomFileLogger()
    })
  }
}

module.exports = CustomFileLoggerProvider

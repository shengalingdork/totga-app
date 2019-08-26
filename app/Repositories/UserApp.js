'use strict'

const UserApp = use('App/Models/UserApp')

class UserAppRepository {
  static get inject () {
    return ['App/Repositories/User']
  }

  constructor (User) {
    this.User = User
  }

  async show(app_type, app_key) {
    const userApp = await UserApp.query().where({
      app_type: app_type,
      app_key: app_key
    }).first()
    return !userApp ? false : userApp.toJSON()
  }

  async create (app_type, app_key, display_name, email_address, user_name) {
    let user = await this.User.show(display_name)

    if (!user) {
      user = await this.User.create(display_name, email_address)
    }

    if (!user) {
      return false
    }

    try {
      const userApp = await UserApp.create({
        user_id: user.id,
        app_type: app_type,
        user_name: user_name,
        app_key: app_key
      })
      return userApp.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

module.exports = UserAppRepository
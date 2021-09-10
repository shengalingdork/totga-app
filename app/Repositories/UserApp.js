'use strict'

const UserApp = use('App/Models/UserApp')
const UserRepo = use('App/Repositories/User')

class UserAppRepository {
  async getSlackUserByUserId (app_type, user_id) {
    const userApp = await UserApp.query().where({
      app_type: app_type,
      user_id: user_id
    }).first()
    return !userApp ? false : userApp.toJSON()
  }

  async show (app_type, app_key) {
    const userApp = await UserApp.query().where({
      app_type: app_type,
      app_key: app_key
    }).first()
    return !userApp ? false : userApp.toJSON()
  }

  async create (app_type, app_key, display_name, email_address, user_name) {
    const User = new UserRepo
    let user = await User.getByEmailAddress(email_address)

    if (!user) {
      user = await User.create(display_name, email_address)
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
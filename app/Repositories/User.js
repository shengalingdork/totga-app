'use strict'

const User = use('App/Models/User')

class UserRepository {
  async show (name) {
    const user = await User.query().where('name', name).first()
    return !user ? false : user.toJSON()
  }

  async create (name, email_address) {
    try {
      const user = await User.create({
        name: name,
        email_address: email_address
      })
      return user.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }
}

module.exports = UserRepository
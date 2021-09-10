'use strict'

const User = use('App/Models/User')

class UserRepository {
  async show (id) {
    const user = await User
      .query()
      .where('id', id)
      .first()
    return !user ? false : user.toJSON()
  }

  async getByEmailAddress (email_address) {
    const user = await User
      .query()
      .where('email_address', email_address)
      .first()
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
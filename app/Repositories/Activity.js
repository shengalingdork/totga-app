'use strict'

const Activity = use('App/Models/Activity')

class ActivityRepository {
  async show (code) {
    const activity = await Activity.query().where('code', code).first()
    return !activity ? false : activity.toJSON()
  }
}

module.exports = ActivityRepository
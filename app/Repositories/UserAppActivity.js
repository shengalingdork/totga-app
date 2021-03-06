'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')

class UserAppActivityRepository {
  async fetch (ids) {
    const userAppActivities = await UserAppActivity.query()
      .whereIn('id', ids)
      .fetch()

    let userAppActivity, userApp, activity, user, appType, activityLog
    let activityLogs = []

    for (let i in userAppActivities.rows) {
      userAppActivity = userAppActivities.rows[i]
      userApp = await userAppActivity.userApp().fetch()
      activity = await userAppActivity.activity().fetch()
      user = await userApp.user().fetch()
      appType = await userApp.app().fetch()
      activityLog = this.cast(
        activity,
        user,
        appType,
        userApp,
        userAppActivity
      )
      activityLogs.push(activityLog)
    }

    return activityLogs
  }

  async create (user_app_id, activity_id, count, start_at, end_at) {
    try {
      const userAppActivity = await UserAppActivity.create({
        user_app_id: user_app_id,
        activity_id: activity_id,
        count: count,
        start_at: start_at,
        end_at: end_at
      })
      return userAppActivity.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  cast(
    activity,
    user,
    appType,
    userApp,
    userAppActivity
  ) {
    return {
      id: userAppActivity.id,
      activity: activity.code,
      user: {
        id: user.id,
        name: user.name,
        email_address: user.email_address,
        app: {
          type: appType.name,
          key: userApp.app_key
        },
      },
      startAt: userAppActivity.start_at,
      endAt: userAppActivity.end_at,
      count: userAppActivity.count
    }
  }
}

module.exports = UserAppActivityRepository
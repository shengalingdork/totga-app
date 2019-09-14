'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')

const SATURDAY_INDEX = 6

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

  async create (user_app_id, activity_id, count, start_at) {
    try {
      const userAppActivity = await UserAppActivity.create({
        user_app_id: user_app_id,
        activity_id: activity_id,
        count: count,
        start_at: this.getStartDate(start_at),
        end_at: this.getEndDate(start_at, count)
      })
      return userAppActivity.toJSON()
    } catch (e) {
      console.log(e)
      return false
    }
  }

  getStartDate (startAt) {
    let startAtCast = new Date(startAt)
    startAtCast.setHours(0,0,0,0)
    return startAtCast
  }

  getEndDate (startAt, count) {
    let endAt = new Date(startAt)
    let day = endAt.getDay()
    endAt.setDate(
      endAt.getDate() +
      (count - 1) +
      (day === SATURDAY_INDEX ? 2 : +!day) +
      (Math.floor((count - 1) / 5) * 2)
    )
    endAt.setHours(23,59,59,999)
    return endAt
  }

  cast (
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
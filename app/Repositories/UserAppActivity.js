'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')

class UserAppActivityRepository {
  async fetch(ids) {
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

  async create(user_app_id, activity_id, count, start_at, end_at) {
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

  async getByUserId(userAppId, {
    startDate = null,
    endDate = null
  }) {
    const query = UserAppActivity.query()
      .where('user_app_id', userAppId)
      .andWhere('is_deleted', 0)

    if (startDate) {
      query.andWhere(function () {
        this.where('start_at', startDate).orWhere('start_at', '<', startDate)
      })
    }

    if (endDate) {
      query.andWhere(function () {
        this.where('end_at', endDate).orWhere('end_at', '>', endDate)
      })
    }

    return await query.orderBy('id', 'desc').first()
  }

  async softDelete(id) {
    try {
      const userAppActivity = await UserAppActivity.find(id)
      userAppActivity.is_deleted = 1
      await userAppActivity.save()
      return true
    } catch (e) {
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
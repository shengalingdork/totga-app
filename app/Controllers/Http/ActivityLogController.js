'use strict'

const Database = use('Database')
const UserAppActivity = use('App/Models/UserAppActivity')
const ActivityLogNotFoundException = use('App/Exceptions/ActivityLogNotFoundException')

class ActivityLogController {
    static get inject () {
        return [
          'App/Repositories/UserAppActivity'
        ]
      }

    constructor (UserAppActivity) {
        this.UserAppActivity = UserAppActivity
    }

    async index ({ request, response, view }) {
        let date = new Date()
        date.setDate(date.getDate() + 1)
        const today = date.toISOString().slice(0, 10)
        const startDate = today + ' 00:00:00'
        const endDate = today + ' 23:59:59'

        let ids = await Database
            .select('user_app_activities.id')
            .from('user_app_activities')
            .leftJoin(
                'user_apps',
                'user_app_activities.user_app_id',
                'user_apps.user_id')
            .where(function() {
                this.where('start_at', startDate).orWhere('start_at', '<', startDate)
            })
            .andWhere(function() {
                this.where('end_at', endDate).orWhere('end_at', '>', endDate)
            })
            .max('user_app_activities.id')
            .groupByRaw('user_apps.user_id')

        ids = ids.map((id) => {
                return id.id
            })

        const activityLogs = await this.UserAppActivity.fetch(ids)

        if (request.format() === 'json') {
            return response.status(200).send({
                status: 200,
                count: activityLogs.length,
                data: activityLogs
            })
        }

        return view.render('main', { activityLogs })
    }

    async show ({ params, response }) {
        const id = params.id
        try {
            const userAppActivity = await UserAppActivity.findOrFail(id)
            const userApp = await userAppActivity.userApp().fetch()
            const activity = await userAppActivity.activity().fetch()
            const user = await userApp.user().fetch()
            const appType = await userApp.app().fetch()

            const activityLog = this.render(
                activity,
                user,
                appType,
                userApp,
                userAppActivity
            )

            return response.status(200).send({
                status: 200,
                data: activityLog
            })
        } catch (e) {
            throw new ActivityLogNotFoundException()
        }
    }

    async create ({ request }) {
        const data = request.post()
        const userAppActivity = new UserAppActivity()
        userAppActivity.user_app_id = data.user_app_id
        userAppActivity.activity_id = data.activity_id
        userAppActivity.count = data.count
        userAppActivity.start_at = this.getStartDate(data.start_at)
        userAppActivity.end_at = this.getEndDate(data.start_at, data.count)
        try {
            const id = await userAppActivity.save()
            return id
        } catch (e) {
            if (request.format() === 'json') {
                return response.status(400).send({
                    status: 400,
                    message: 'Activity log cannot be recorded.',
                    error: e
                })
            }
            return e
        }
    }

    render (
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

    getStartDate (startAt) {
        let date = new Date(startAt)
        date.setHours(0,0,0,0)
        return date
    }

    getEndDate (startAt, count) {
        let date = new Date(startAt)
        date.setDate(parseInt(date.getDate()) + parseInt(count - 1))
        date.setHours(23,59,59,999)
        return date
    }
}

module.exports = ActivityLogController

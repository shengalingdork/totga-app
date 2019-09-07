'use strict'

const Database = use('Database')
const UserAppActivity = use('App/Models/UserAppActivity')
const ActivityLogNotFoundException = use('App/Exceptions/ActivityLogNotFoundException')

class ActivityLogController {
    async index ({ params, response }) {
        const date = new Date().toISOString().slice(0, 10)
        const startDate = date + ' 00:00:00'
        const endDate = date + ' 23:59:59'

        const userAppActivities = await UserAppActivity.query()
            .where(function() {
                this.where('start_at', startDate).orWhere('start_at', '<', startDate)
            })
            .andWhere(function() {
                this.where('end_at', endDate).orWhere('end_at', '>', endDate)
            })
            .fetch()

        let userAppActivity, userApp, activity, user, appType, activityLog
        let activityLogs = []

        for (let i in userAppActivities.rows) {
            userAppActivity = userAppActivities.rows[i]
            userApp = await userAppActivity.userApp().fetch()
            activity = await userAppActivity.activity().fetch()
            user = await userApp.user().fetch()
            appType = await userApp.app().fetch()
            activityLog = this.render(
                activity,
                user,
                appType,
                userApp,
                userAppActivity
            )
            activityLogs.push(activityLog)
        }

        return response.status(200).send({
            status: 200,
            count: activityLogs.length,
            data: activityLogs
        })
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

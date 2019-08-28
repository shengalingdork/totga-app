'use strict'

const UserAppActivity = use('App/Models/UserAppActivity')
const ActivityLogNotFoundException = use('App/Exceptions/ActivityLogNotFoundException')

class ActivityLogController {
    async show ({ params, response }) {
        const id = params.id
        try {
            const userAppActivity = await UserAppActivity.findOrFail(id)
            const activity = await userAppActivity.activity().fetch()
            const userApp = await userAppActivity.userApp().fetch()
            const user = await userApp.user().fetch()
            const appType = await userApp.app().fetch()

            const activityLog = {
                activity: activity.code,
                user: {
                    name: user.name,
                    email_address: user.email_address
                },
                app: {
                    type: appType.name,
                    key: userApp.app_key
                },
                startAt: userAppActivity.start_at,
                endAt: userAppActivity.end_at,
                count: userAppActivity.count
            }

            return response.status(200).send({
                status:200,
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

    getStartDate (startAt) {
        let startAtCast = new Date(startAt)
        startAtCast.setHours(0,0,0,0)
        return startAtCast
    }

    getEndDate (startAt, count) {
        let endAt = new Date(startAt)
        endAt.setDate(parseInt(endAt.getDate()) + parseInt(count - 1))
        endAt.setHours(23,59,59,999)
        return endAt
    }
}

module.exports = ActivityLogController

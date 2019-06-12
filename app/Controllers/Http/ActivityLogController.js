'use strict'

const User = use('App/Models/User')
const App = use('App/Models/App')
const Activity = use('App/Models/Activity')
const AppId = use('App/Models/AppId')
const AppActivity = use('App/Models/AppActivity')
const ActivityLogNotFoundException = use('App/Exceptions/ActivityLogNotFoundException')

class ActivityLogController {
    async show ({ params }) {
        const id = params.id
        try {
            const appActivity = await AppActivity.findOrFail(id)
            return appActivity
        } catch (e) {
            throw new ActivityLogNotFoundException()
        }
    }

    async create ({ request }) {
        const data = request.post()
        const appActivity = new AppActivity()
        appActivity.app_id = data.app_id
        appActivity.activity_id = data.activity_id
        appActivity.count = data.count
        appActivity.start_at = data.start_at
        let end_at = new Date(data.start_at)
        end_at.setDate(end_at.getDate() + data.count)
        appActivity.end_at = end_at
        try {
            const id = await appActivity.save()
            return id
        } catch (e) {
            return e
        }
    }
}

module.exports = ActivityLogController

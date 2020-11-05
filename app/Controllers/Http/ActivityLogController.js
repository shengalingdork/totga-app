'use strict'

const Database = use('Database')
const ActivityLogNotFoundException = use('App/Exceptions/ActivityLogNotFoundException')

class ActivityLogController {
    static get inject () {
        return [
          'App/Repositories/CustomDate',
          'App/Repositories/UserAppActivity'
        ]
      }

    constructor (CustomDate, UserAppActivity) {
        this.CustomDate = CustomDate
        this.UserAppActivity = UserAppActivity
    }

    async index ({ request, response, view }) {
        const today = this.CustomDate.getDatetimeNow()
        const startDate = this.CustomDate.getStartDate(today.date)
        const endDate = this.CustomDate.getEndDate(today.date)

        let ids = await Database
            .select('user_app_activities.id')
            .from('user_app_activities')
            .leftJoin(
                'user_apps',
                'user_app_activities.user_app_id',
                'user_apps.id')
            .where(function() {
                this.where('start_at', startDate).orWhere('start_at', '<', startDate)
            })
            .andWhere(function() {
                this.where('end_at', endDate).orWhere('end_at', '>', endDate)
            })
            .max('user_app_activities.id as max_id')
            .groupByRaw('user_apps.user_id')

        ids = ids.map(id => id.max_id)

        const activityLogs = await this.UserAppActivity.fetch(ids)

        if (request.format() === 'json') {
            return response.status(200).send({
                status: 200,
                count: activityLogs.length,
                data: activityLogs
            })
        }

        return view.render('main', { today, activityLogs })
    }

    async show ({ params, response }) {
        const id = params.id
        const activityLogs = await this.UserAppActivity.fetch([id])
        if (activityLogs.length > 0) {
            return response.status(200).send({
                status: 200,
                count: activityLogs.length,
                data: activityLogs
            })
        } else {
            throw new ActivityLogNotFoundException()
        }
    }
}

module.exports = ActivityLogController

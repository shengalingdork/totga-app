'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route
  .post('webhook/slack', 'WebhookController.slack')
  .middleware(['slackAuth'])

Route.get('webhook/getAccessToken', 'TeamCalendarController.getAccessToken')
Route.get('storeUserActivities', 'TeamCalendarController.storeUserActivities')

Route.get('activity_log/:id', 'ActivityLogController.show').formats(['json'])
Route.post('activity_log', 'ActivityLogController.create')

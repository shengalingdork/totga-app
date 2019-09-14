'use strict'

const Ws = use('Ws')
const Activity = exports = module.exports = {}

Activity.submitted = async (data) => {
  Ws
    .getChannel('update')
    .topic('update')
    .broadcast('entry', data)
}

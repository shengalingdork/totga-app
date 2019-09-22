'use strict'

const moment = require('moment-business-days')

class CustomDateRepository {
  getDatetimeNow () {
    const now = moment()
    return {
      utc: now.utc(),
      date: now.tz('Asia/Manila').format('YYYY-MM-DDTHH:mm:ss'),
      month: now.format('MMM').toUpperCase(),
      day: now.format('DD'),
      dayOfWeek: now.format('d')
    }
  }

  getStartDate (date) {
    return moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss')
  }

  getEndDate (date, count = 1) {
    return moment(date).businessAdd(count - 1).endOf('day').format('YYYY-MM-DD HH:mm:ss')
  }

  getStartDateUTC (date) {
    return moment(date).startOf('day').utc().format('YYYY-MM-DDTHH:mm:ssZ')
  }

  getEndDateUTC (date) {
    return moment(date).endOf('day').utc().format('YYYY-MM-DDTHH:mm:ssZ')
  }

  isActivityDateValid (date) {
    return moment(date).isBusinessDay()
  }
}

module.exports = CustomDateRepository
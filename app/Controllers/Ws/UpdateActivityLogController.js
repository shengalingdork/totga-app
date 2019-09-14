'use strict'

class UpdateActivityLogController {
  constructor ({ socket, request }) {
    this.socket = socket
    this.request = request
  }

  onEntry (entry) {
    this.socket.broadcastToAll('entry', entry)
  }
}

module.exports = UpdateActivityLogController

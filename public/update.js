let ws = null

$(() => {
  start()
})

function start () {
  ws = adonis.Ws().connect()

  ws.on('open', () => {
    console.log('connected')
    subscribe()
  })

  ws.on('error', () => {
    console.log('not connected')
  })
}

function subscribe () {
  const update = ws.subscribe('update')

  update.on('error', () => {
    console.log('error encountered in displaying')
  })

  update.on('entry', (entry) => {
    $(`#${entry[0].user.id}`).remove()
    $('ul').append(
      `<li id="${entry[0].user.id}">` +
      `${entry[0].activity} - ${entry[0].user.name}` +
      `</li>`
    )
  })
}
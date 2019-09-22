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
    const entries = $('.body').children()
    const lastEntryID = entries[entries.length-1].id
    const isEven = lastEntryID % 2 === 0
    let html

    if (isEven) {
      html =
        `<div id="${parseInt(lastEntryID) + 1}" class="card user-${entry[0].user.id}">` +
          `<div class="card-item">` +
            `<img ` +
              `src="./images/${entry[0].activity.toLowerCase()}_icon.png" ` +
              `class="card-img-left" />` +
          `</div>` +
          `<div class="card-item card-left">` +
            `<div class="card-border-left ${entry[0].activity.toLowerCase()}">` +
              `<p class="card-content">${entry[0].user.name.toLowerCase()}</p>` +
            `</div>` +
          `</div>` +
        `</div>`
    } else {
      html =
        `<div id="${parseInt(lastEntryID) + 1}" class="card reverse user-${entry[0].user.id}">` +
          `<div class="card-item">` +
            `<img ` +
              `src="./images/${entry[0].activity.toLowerCase()}_icon.png" ` +
              `class="card-img-right" />` +
          `</div>` +
          `<div class="card-item card-right">` +
            `<div class="card-border-right ${entry[0].activity.toLowerCase()}">` +
              `<p class="card-content">${entry[0].user.name.toLowerCase()}</p>` +
            `</div>` +
          `</div>` +
        `</div>`
    }

    $(`.user-${entry[0].user.id}`).remove()
    $('.body').append(html)
  })
}
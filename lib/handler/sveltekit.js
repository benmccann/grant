var qs = require('qs')
var Grant = require('../grant')
var Session = require('../session')

module.exports = function (args = {}) {
  var grant = Grant(args.config ? args : {config: args})
  app.config = grant.config

  var regex = new RegExp([
    '^',
    app.config.defaults.prefix,
    /(?:\/([^\/\?]+?))/.source, // /:provider
    /(?:\/([^\/\?]+?))?/.source, // /:override?
    /(?:\/$|\/?\?+.*)?$/.source, // querystring
  ].join(''), 'i')

  var store = Session(args.session)

  async function app ({ event, resolve }) {
    var session = store(event.request)
    var match = regex.exec(event.url.pathname + event.url.search)
    if (!match) {
      return resolve(event)
    }

    var {location, session:sess, state} = await grant({
      method: event.request.method,
      params: {provider: match[1], override: match[2]},
      query: qs.parse(event.url.searchParams.toString()),
      body: qs.parse(await event.request.text()),
      state,
      session: (await session.get()).grant,
    })

    await session.set({grant: sess})

    if (location) {
      return new Response(null, {
        status: 307,
        headers: {
          location,
          'set-cookie': session.headers['set-cookie']
        }
      })
    } else {
      return resolve(event)
    }
  }

  return app
}

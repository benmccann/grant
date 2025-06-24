var pq = require('picoquery')


var compose = (...fns) => (args) =>
  fns.reduce((p, f) => p.then(f), Promise.resolve(args))

var dcopy = (obj) =>
  JSON.parse(JSON.stringify(obj))

var parse = (str) =>
  pq.parse(str, { nestingSyntax: 'js' })

var stringify = (obj) =>
  pq.stringify(obj, { nestingSyntax: 'index' })

module.exports = {compose, dcopy, parse, stringify}

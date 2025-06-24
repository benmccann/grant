
var compose = require('request-compose')
var oauth = require('request-oauth')
var util = require('./util')
var pkg = require('../package')


var defaults = (args) => () => {
  var {options} = compose.Request.defaults(args)()
  options.headers['user-agent'] = `simov/grant/${pkg.version}`
  return {options}
}

var parse = () => ({options, res, res: {headers}, body, raw}) => {

  raw = body

  var header = Object.keys(headers)
    .find((name) => name.toLowerCase() === 'content-type')

  if (/json|javascript/.test(headers[header])) {
    try {
      body = JSON.parse(body)
    }
    catch (err) {}
  }

  else if (/application\/x-www-form-urlencoded/.test(headers[header])) {
    try {
      body = util.parse(body) // supports nested objects
    }
    catch (err) {}
  }

  // some providers return incorrect content-type like text/html or text/plain
  else {
    try {
      body = JSON.parse(body)
    }
    catch (err) {
      body = util.parse(body) // supports nested objects
    }
  }

  log({parse: {res, body}})

  return {options, res, body, raw}
}

var log = (data) => {
  if (process.env.DEBUG) {
    try {
      require('request-logs')(data)
    }
    catch (err) {}
  }
}

module.exports = compose.extend({
  Request: {defaults, oauth},
  Response: {parse}
}).client

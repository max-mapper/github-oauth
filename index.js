var request = require('request')
var events = require('events')
var url = require('url')
var path = require('path')
var crypto = require('crypto')

module.exports = function(opts) {
  if (!opts.callbackURI) opts.callbackURI = '/github/callback'
  if (!opts.loginURI) opts.loginURI = '/github/login'
  if (!opts.scope) opts.scope = 'user'
  var state = crypto.randomBytes(8).toString('hex')
  var urlObj = url.parse(opts.baseURL)
  urlObj.pathname = path.join(urlObj.pathname, opts.callbackURI)
  var redirectURI = url.format(urlObj)
  var emitter = new events.EventEmitter()
  
  function addRoutes(router, loginCallback) {
    // compatible with flatiron/director
    router.get(opts.loginURI, login)
    router.get(opts.callbackURI, callback)
    if (!loginCallback) return
    emitter.on('error', function(token, err, resp, tokenResp) {
      loginCallback(err, token, resp, tokenResp)
    })
    emitter.on('token', function(token, resp, tokenResp) {
      loginCallback(false, token, resp, tokenResp)
    })
  }
  
  function login(req, resp) {
    var u = 'https://github.com/login/oauth/authorize'
        + '?client_id=' + opts.githubClient
        + '&scope=' + opts.scope
        + '&redirect_uri=' + redirectURI
        + '&state=' + state
        ;
    resp.statusCode = 302
    resp.setHeader('location', u)
    resp.end()
  }

  function callback(req, resp) {
    var query = url.parse(req.url, true).query
    var code = query.code
    if (!code) return emitter.emit('error', {error: 'missing oauth code'}, resp)
    var u = 'https://github.com/login/oauth/access_token'
       + '?client_id=' + opts.githubClient
       + '&client_secret=' + opts.githubSecret
       + '&code=' + code
       + '&state=' + state
       ;
    request.get({url:u, json: true}, function (err, tokenResp, body) {
      if (err) return emitter.emit('error', body, err, resp, tokenResp)
      emitter.emit('token', body, resp, tokenResp)
    })
  }
  
  emitter.login = login
  emitter.callback = callback
  emitter.addRoutes = addRoutes
  return emitter
}

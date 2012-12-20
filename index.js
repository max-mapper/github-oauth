var request = require('request')
var url = require('url')
var path = require('path')
var crypto = require('crypto')

module.exports = function(opts) {
  if (!opts.callbackURI) opts.callbackURI = '/github/callback'
  if (!opts.loginURI) opts.loginURI = '/github/login'
  var state = crypto.randomBytes(8).toString('hex')
  var urlObj = url.parse(opts.baseURL)
  urlObj.pathname = path.join(urlObj.pathname, opts.callbackURI)
  var redirectURI = url.format(urlObj)
  
  function addRoutes(router) {
    // compatible with flatiron/director
    router.get(opts.loginURI, login)
    router.get(opts.callbackURI, callback)
  }
  
  function login(req, resp) {
    var u = 'https://github.com/login/oauth/authorize'
        + '?client_id=' + opts.githubClient
        + '&scopes=user'
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
    if (!code) {
      resp.statusCode = 400
      resp.end(JSON.stringify({"error": "missing oauth code"}))
    }
    var u = 'https://github.com/login/oauth/access_token'
       + '?client_id=' + opts.githubClient
       + '&client_secret=' + opts.githubSecret
       + '&code=' + code
       + '&state=' + state
       ;
    request.get({url:u, json: true}, function (e, r, body) {
      if (e) {
        resp.statusCode = 403
        resp.end(JSON.stringify(e))
        return
      }
      resp.statusCode = 200
      resp.end(JSON.stringify(body))
    })
  }
  
  return {login: login, callback: callback, addRoutes: addRoutes}
}

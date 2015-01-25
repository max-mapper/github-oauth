# github-oauth

simple functions for doing oauth login with github. compatible with any node http server that uses handler callbacks that look like `function(req, res) {}`

## usage

```javascript
var githubOAuth = require('github-oauth')({
  githubClient: process.env['GITHUB_CLIENT'],
  githubSecret: process.env['GITHUB_SECRET'],
  baseURL: 'http://localhost',
  loginURI: '/login',
  callbackURI: '/callback',
  scope: 'user' // optional, default scope is set to user
})

require('http').createServer(function(req, res) {
  if (req.url.match(/login/)) return githubOAuth.login(req, res)
  if (req.url.match(/callback/)) return githubOAuth.callback(req, res)
}).listen(80)

githubOAuth.on('error', function(err) {
  console.error('there was a login error', err)
})

githubOAuth.on('token', function(token, serverResponse) {
  console.log('here is your shiny new github oauth token', token)
  serverResponse.end(JSON.stringify(token))
})

// now go to http://localhost/login
```

If you want to support [no scope](https://developer.github.com/v3/oauth/#scopes), pass in `scope: ''`

## bonus feature

```javascript
  githubOauth.addRoutes(myAppRouter)
  // where myAppRouter is a router that will work with:
  // myAppRouter.get('/github/login', function(req, res) {})
  // http://github.com/flatiron/director works like this
  
  // or even more bonus:
  githubOauth.addRoutes(myAppRouter, function(err, token, serverResponse, tokenResponse) {
    
  })
  
```
## license

BSD LICENSED

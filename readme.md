# github-oauth

simple functions for doing oauth with github. compatible with any node http server that uses handler callbacks that look like `function(req, res) {}`

## usage

```javascript
var githubOauth = require('github-oauth')({
  githubClient: process.env['GITHUB_CLIENT'],
  githubSecret: process.env['GITHUB_SECRET'],
  baseURL: 'http://localhost'
})

require('http').createServer(function(req, res) {
  if (req.url.match(/login/)) return githubOauth.login(req, res)
  if (req.url.match(/callback/)) return githubOauth.callback(req, res)
}).listen(80)

// now go to http://localhost/login
```

## bonus feature

```javascript
  githubOauth.addRoutes(myAppRouter)
  // where myAppRouter is a router that will work with:
  // myAppRouter.get('/github/login', function(req, res) {})
  // http://github.com/flatiron/director works like this
```
## license

BSD LICENSED
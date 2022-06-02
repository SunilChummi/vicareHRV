var http = require('http')
const env = require('./src/config/environments/env.js')
const config = require(`./src/config/environments/${env.env}.js`)
const app = require('./src/app')

const server = http.createServer(app)
server.listen(config.port, () => {
  console.log('http://localhost:' + config.port)
})

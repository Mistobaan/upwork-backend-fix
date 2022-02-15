const express = require('express')
const Router = express.Router
const customers = require('./routes/customers')
const properties = require('./routes/properties')
const devices = require('./routes/devices')
const alerts = require('./routes/alerts')
const users = require('./routes/users')
const general = require('./routes/general')

module.exports = () =>{
    const app = Router()

    app.use(users)
    app.use(alerts)
    app.use(customers)
    app.use(properties)
    app.use(devices)
    app.use(general)
    return app
}

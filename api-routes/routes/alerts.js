const express = require('express');
const route = express.Router();
const config = require('../../config/index')
const alertService = require('../../services/alerts')
const alertRegister = require('../../services/alertRegister')
const permit = require('../../auth/roleAuthorization');

route.get('/status-options', async (_, res) => {
    const statusOpt = config.config.statusOpt
    res.jsonp(statusOpt)
})

route.get('/new-alerts',async (req, res) => {
    const result = await alertRegister.checkForAlarms()
    res.jsonp(result)
})

route.post('/alerts-to-table',permit(config.users.roles.OPERATOR, config.users.roles.ADMIN), async (req, res) => {
    const result = await alertService.getAllAlarms(req.body)
    res.jsonp(result)
})

route.post('/change-status',permit(config.users.roles.OPERATOR, config.users.roles.ADMIN), async (req, res) => {
    const result = await alertService.changeStatus(req.body,req.user)
    res.jsonp(result)
})

route.get('/alerts-count',permit(config.users.roles.OPERATOR, config.users.roles.ADMIN),async(req,res)=>{
    const result = await alertService.countAlertByStatus()
    res.jsonp(result)
})

module.exports = route

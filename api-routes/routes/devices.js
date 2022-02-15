const express = require('express');
const route = express.Router();
const config = require('../../config/index');
const devicesService = require('../../services/devices')
const twilioService = require('../../services/twilio')
const permit = require('../../auth/roleAuthorization');



route.get('/device-types', async (_, res) => {
    res.jsonp(config.devices['types'])
})

route.post('/incoming-sms', async (req, res) => {
    const messageBody = req.body
    if(await twilioService.incomingSMS(messageBody)){
        res.end()
    }else{
        res.status(500)
    }
})

route.get('/device-list',permit(config.users.roles.TECHNICIAN, config.users.roles.ADMIN), async (req, res) => {
    const withCustomer = req.query.customers
    const result = await devicesService.getAllDevices(withCustomer)
    res.jsonp(result)
})

route.post('/get-device',permit(config.users.roles.TECHNICIAN, config.users.roles.ADMIN), async (req, res) => {
    const deviceDetails = req.body
    const result = await devicesService.getDevice(deviceDetails)
    res.jsonp(result)
})
route.put('/update-devices',permit(config.users.roles.TECHNICIAN, config.users.roles.ADMIN), async (req, res) => {
    const deviceDetails = req.body
    const result = await devicesService.updateDevice(deviceDetails)
    res.jsonp(result)
})

route.post('/init-panel',permit(config.users.roles.TECHNICIAN, config.users.roles.ADMIN), async (req, res) => {
    const result = await devicesService.initPanel(req.body,req.user)
    if (result['status'] === 'ERR')
        console.error(result['info']);
    res.jsonp(result)
})

route.post('/config-panel',permit(config.users.roles.TECHNICIAN, config.users.roles.ADMIN),async (req,res)=>{
    await devicesService.configPanel(req.body,req.user)
    res.jsonp('OK')
})

route.post('/disarm-device',permit(config.users.roles.ADMIN,config.users.roles.OPERATOR),async (req,res)=>{
    await devicesService.disarmDevice(req.body,req.user)
    res.jsonp('OK')
})

module.exports = route

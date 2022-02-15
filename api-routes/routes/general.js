const express = require('express');
const route = express.Router();
const permit = require('../../auth/roleAuthorization');
const generalServices = require('../../services/general')
const configRules = require('../../config').users

route.get('/setting',permit(configRules.roles.ADMIN), async (req, res) => {
    const result = await generalServices.getSetting()
    res.jsonp(result)
})
route.post('/setting',permit(configRules.roles.ADMIN), async (req, res) => {
    const result = await generalServices.updateSetting(req.body)
    res.jsonp(result)
})

module.exports = route

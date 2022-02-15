const express = require('express');
const route = express.Router();
const propertiesService = require('../../services/properties')
const permit = require('../../auth/roleAuthorization');
const configRules = require('../../config').users
const configProperty = require('../../config').property


route.post('/new-property',permit(configRules.roles.OPERATOR, configRules.roles.ADMIN), async (req, res) => {
    const propertyData = req.body
    const result = await propertiesService.addProperty(propertyData)

    if (result['status'] === 'ERR')
        console.log(result['info']);

    res.jsonp(result)
})

route.post('/edit-property',permit(configRules.roles.OPERATOR, configRules.roles.ADMIN), async (req, res) => {
    const propertyData = req.body
    const result = await propertiesService.editProperty(propertyData)

    if (result['status'] === 'ERR')
        console.log(result['info']);

    res.jsonp(result)
})

route.delete('/delete-property',permit(configRules.roles.OPERATOR, configRules.roles.ADMIN), async (req, res) => {
    const propertyData = req.body
    const result = await propertiesService.deleteProperty(propertyData)

    if (result['status'] === 'ERR')
        console.log(result['info']);

    res.jsonp(result)
})

route.get('/all-properties',permit(configRules.roles.TECHNICIAN,configRules.roles.OPERATOR, configRules.roles.ADMIN), async (_, res) => {
    const result = await propertiesService.getAllProperties()


    if (result['status'] === 'ERR')
        console.log(result['info']);

    res.jsonp(result)
})

route.get('/properties-type',async (_,res)=>{
    res.jsonp(configProperty.types)
})

module.exports = route
